import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { dirname, extname, join, normalize, resolve } from 'path';
import { Repository } from 'typeorm';
import { normalizeFreeText, normalizeLabelText } from '../../common/text.util';
import { ActaEntity, UsuarioEntity } from '../../database/entities';
import { UpsertActaDto } from './dto/upsert-acta.dto';

type StoredActaFile = {
  relativePath: string;
  size: number;
};

@Injectable()
export class MeetingsMinutesService {
  private static readonly MAX_ACTA_FILE_SIZE_BYTES = 5 * 1024 * 1024;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
  ) {}

  async ensureActaDataIsValid(userId: number, acta: UpsertActaDto) {
    this.ensureActaPayloadHasContent(acta);
    await this.resolveActaActor(userId);
  }

  async upsertActa(
    minutesRepository: Repository<ActaEntity>,
    meetingId: number,
    acta: UpsertActaDto,
    actorUserId: number,
  ) {
    const actor = await this.resolveActaActor(actorUserId);
    const currentActa = await minutesRepository.findOneBy({
      idReunion: meetingId,
    });
    const descripcion = acta.descripcion
      ? normalizeFreeText(acta.descripcion)
      : '';
    const archivo = acta.archivo;
    const storedFile = archivo
      ? await this.saveActaFile(meetingId, archivo)
      : null;

    await minutesRepository.save(
      minutesRepository.create({
        idActa: currentActa?.idActa,
        idReunion: meetingId,
        titulo: acta.titulo ? normalizeLabelText(acta.titulo) : null,
        texto: descripcion,
        archivoNombre: archivo?.nombre ?? null,
        archivoTipo: archivo?.tipo ?? null,
        archivoContenidoBase64: null,
        archivoRuta: storedFile?.relativePath ?? null,
        archivoTamanoBytes: storedFile?.size ?? null,
        fechaActualizacion: new Date(),
        actualizadoPorId: actor.idUsuario,
        idRol: actor.idRol,
      }),
    );

    if (
      currentActa?.archivoRuta &&
      currentActa.archivoRuta !== storedFile?.relativePath
    ) {
      await this.deleteStoredFile(currentActa.archivoRuta);
    }
  }

  async deleteActaFile(acta: ActaEntity | null) {
    if (acta?.archivoRuta) {
      await this.deleteStoredFile(acta.archivoRuta);
    }
  }

  async mapActa(acta: ActaEntity | null) {
    if (!acta) {
      return null;
    }

    const contenidoBase64 = await this.resolveActaFileContent(acta);

    return {
      idActa: acta.idActa,
      titulo: acta.titulo,
      descripcion: acta.texto,
      archivo: contenidoBase64
        ? {
            nombre: acta.archivoNombre ?? 'acta-adjunta',
            tipo: acta.archivoTipo ?? 'application/octet-stream',
            contenidoBase64,
            tamanoBytes: acta.archivoTamanoBytes ?? 0,
          }
        : null,
      fechaActualizacion: acta.fechaActualizacion,
      actualizadoPor: {
        idUsuario: acta.actualizadoPor.idUsuario,
        nombre: acta.actualizadoPor.nombre,
      },
      rol: {
        idRol: acta.rol.idRol,
        nombre: acta.rol.nombre,
      },
    };
  }

  private ensureActaPayloadHasContent(acta: UpsertActaDto) {
    const hasDescripcion = Boolean(acta.descripcion?.trim());
    const hasArchivo = Boolean(acta.archivo?.contenidoBase64?.trim());

    if (!hasDescripcion && !hasArchivo) {
      throw new BadRequestException(
        'Debes ingresar una descripcion o adjuntar un archivo para el acta.',
      );
    }

    if (
      acta.archivo &&
      acta.archivo.tamanoBytes > MeetingsMinutesService.MAX_ACTA_FILE_SIZE_BYTES
    ) {
      throw new BadRequestException(
        'El archivo del acta no puede superar los 5 MB.',
      );
    }
  }

  private async resolveActaActor(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { idUsuario: userId },
      relations: {
        usuarioRoles: {
          rol: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('El usuario autenticado no existe.');
    }

    const roles = [...(user.usuarioRoles ?? [])]
      .map((userRole) => userRole.rol)
      .sort((first, second) => {
        if (first.nombre === 'admin') {
          return -1;
        }

        if (second.nombre === 'admin') {
          return 1;
        }

        return first.nombre.localeCompare(second.nombre);
      });

    const primaryRole = roles[0];

    if (!primaryRole) {
      throw new BadRequestException(
        'El usuario autenticado no tiene roles asignados para registrar el acta.',
      );
    }

    return {
      idUsuario: user.idUsuario,
      idRol: primaryRole.idRol,
    };
  }

  private async saveActaFile(
    meetingId: number,
    file: NonNullable<UpsertActaDto['archivo']>,
  ): Promise<StoredActaFile> {
    const buffer = Buffer.from(file.contenidoBase64, 'base64');

    if (buffer.length > MeetingsMinutesService.MAX_ACTA_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        'El archivo del acta no puede superar los 5 MB.',
      );
    }

    const extension = this.safeExtension(file.nombre);
    const relativePath = normalize(
      join(String(meetingId), `${randomUUID()}${extension}`),
    );
    const fullPath = this.resolveStoragePath(relativePath);

    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);

    return {
      relativePath,
      size: buffer.length,
    };
  }

  private async resolveActaFileContent(acta: ActaEntity) {
    if (acta.archivoRuta) {
      try {
        const buffer = await readFile(
          this.resolveStoragePath(acta.archivoRuta),
        );

        return buffer.toString('base64');
      } catch {
        return null;
      }
    }

    return acta.archivoContenidoBase64;
  }

  private async deleteStoredFile(relativePath: string) {
    try {
      await unlink(this.resolveStoragePath(relativePath));
    } catch {
      return;
    }
  }

  private resolveStoragePath(relativePath: string) {
    const storageRoot = resolve(
      this.configService.get<string>('app.attachmentsDir') ??
        join(process.cwd(), 'storage'),
      'actas',
    );
    const fullPath = resolve(storageRoot, relativePath);

    if (!fullPath.startsWith(storageRoot)) {
      throw new BadRequestException('Ruta de archivo de acta invalida.');
    }

    return fullPath;
  }

  private safeExtension(fileName: string) {
    const extension = extname(fileName).toLowerCase();

    return /^[a-z0-9.]+$/.test(extension) ? extension : '';
  }
}
