import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  ActaEntity,
  ParticipanteReunionEntity,
  ReunionEntity,
  UsuarioEntity,
} from '../../database/entities';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UpsertActaDto } from './dto/upsert-acta.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ReunionEntity)
    private readonly meetingsRepository: Repository<ReunionEntity>,
    @InjectRepository(ParticipanteReunionEntity)
    private readonly participantsRepository: Repository<ParticipanteReunionEntity>,
    @InjectRepository(ActaEntity)
    private readonly minutesRepository: Repository<ActaEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
  ) {}

  async findAll() {
    const meetings = await this.meetingsRepository.find({
      relations: {
        participantes: true,
        acta: true,
      },
      order: {
        fecha: 'DESC',
        horaInicio: 'DESC',
      },
    });

    return meetings.map((meeting) => ({
      idReunion: meeting.idReunion,
      fecha: meeting.fecha,
      horaInicio: meeting.horaInicio,
      horaFin: meeting.horaFin,
      lugar: meeting.lugar,
      estado: meeting.estado,
      modalidad: meeting.modalidad,
      participantCount: meeting.participantes?.length ?? 0,
      hasActa: Boolean(meeting.acta),
    }));
  }

  async findOne(id: number) {
    const meeting = await this.meetingsRepository.findOne({
      where: { idReunion: id },
      relations: {
        participantes: {
          usuario: {
            usuarioRoles: {
              rol: true,
            },
          },
        },
        acta: {
          actualizadoPor: {
            usuarioRoles: {
              rol: true,
            },
          },
          rol: true,
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Reunion no encontrada.');
    }

    return this.mapMeetingDetail(meeting);
  }

  async create(createMeetingDto: CreateMeetingDto, actorUserId: number) {
    this.validateMeetingTimes(
      createMeetingDto.horaInicio,
      createMeetingDto.horaFin,
    );

    const participantIds = this.uniqueIds(
      createMeetingDto.participantIds ?? [],
    );
    await this.ensureUsersExist(participantIds);

    if (createMeetingDto.acta) {
      await this.ensureActaDataIsValid(actorUserId);
    }

    const meetingId = await this.dataSource.transaction(async (manager) => {
      const meetingRepository = manager.getRepository(ReunionEntity);
      const participantRepository = manager.getRepository(
        ParticipanteReunionEntity,
      );
      const minutesRepository = manager.getRepository(ActaEntity);

      const meeting = await meetingRepository.save(
        meetingRepository.create({
          fecha: createMeetingDto.fecha,
          horaInicio: createMeetingDto.horaInicio,
          horaFin: createMeetingDto.horaFin,
          lugar: createMeetingDto.lugar,
          estado: createMeetingDto.estado,
          modalidad: createMeetingDto.modalidad,
        }),
      );

      await this.replaceParticipants(
        participantRepository,
        meeting.idReunion,
        participantIds,
      );

      if (createMeetingDto.acta) {
        await this.upsertActa(
          minutesRepository,
          meeting.idReunion,
          createMeetingDto.acta,
          actorUserId,
        );
      }

      return meeting.idReunion;
    });

    return this.findOne(meetingId);
  }

  async update(
    id: number,
    updateMeetingDto: UpdateMeetingDto,
    actorUserId: number,
  ) {
    const currentMeeting = await this.meetingsRepository.findOne({
      where: { idReunion: id },
    });

    if (!currentMeeting) {
      throw new NotFoundException('Reunion no encontrada.');
    }

    const nextHoraInicio =
      updateMeetingDto.horaInicio ?? currentMeeting.horaInicio;
    const nextHoraFin = updateMeetingDto.horaFin ?? currentMeeting.horaFin;

    this.validateMeetingTimes(nextHoraInicio, nextHoraFin);

    const participantIds =
      updateMeetingDto.participantIds !== undefined
        ? this.uniqueIds(updateMeetingDto.participantIds)
        : null;

    if (participantIds) {
      await this.ensureUsersExist(participantIds);
    }

    if (updateMeetingDto.acta) {
      await this.ensureActaDataIsValid(actorUserId);
    }

    await this.dataSource.transaction(async (manager) => {
      const meetingRepository = manager.getRepository(ReunionEntity);
      const participantRepository = manager.getRepository(
        ParticipanteReunionEntity,
      );
      const minutesRepository = manager.getRepository(ActaEntity);

      await meetingRepository.save(
        meetingRepository.create({
          ...currentMeeting,
          fecha: updateMeetingDto.fecha ?? currentMeeting.fecha,
          horaInicio: nextHoraInicio,
          horaFin: nextHoraFin,
          lugar: updateMeetingDto.lugar ?? currentMeeting.lugar,
          estado: updateMeetingDto.estado ?? currentMeeting.estado,
          modalidad: updateMeetingDto.modalidad ?? currentMeeting.modalidad,
        }),
      );

      if (participantIds) {
        await this.replaceParticipants(
          participantRepository,
          id,
          participantIds,
        );
      }

      if (updateMeetingDto.acta) {
        await this.upsertActa(
          minutesRepository,
          id,
          updateMeetingDto.acta,
          actorUserId,
        );
      }
    });

    return this.findOne(id);
  }

  private uniqueIds(ids: number[]) {
    return [...new Set(ids)];
  }

  private async ensureUsersExist(userIds: number[]) {
    if (userIds.length === 0) {
      return;
    }

    const users = await this.usersRepository.findBy({
      idUsuario: In(userIds),
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException('Uno o mas participantes no existen.');
    }
  }

  private async ensureActaDataIsValid(userId: number) {
    await this.resolveActaActor(userId);
  }

  private validateMeetingTimes(horaInicio: string, horaFin: string) {
    if (horaFin <= horaInicio) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio.',
      );
    }
  }

  private async replaceParticipants(
    participantRepository: Repository<ParticipanteReunionEntity>,
    meetingId: number,
    participantIds: number[],
  ) {
    await participantRepository.delete({ idReunion: meetingId });

    if (participantIds.length === 0) {
      return;
    }

    await participantRepository.save(
      participantIds.map((idUsuario) =>
        participantRepository.create({
          idReunion: meetingId,
          idUsuario,
        }),
      ),
    );
  }

  private async upsertActa(
    minutesRepository: Repository<ActaEntity>,
    meetingId: number,
    acta: UpsertActaDto,
    actorUserId: number,
  ) {
    const actor = await this.resolveActaActor(actorUserId);
    const currentActa = await minutesRepository.findOneBy({
      idReunion: meetingId,
    });

    await minutesRepository.save(
      minutesRepository.create({
        idActa: currentActa?.idActa,
        idReunion: meetingId,
        texto: acta.texto,
        fechaActualizacion: new Date(),
        actualizadoPorId: actor.idUsuario,
        idRol: actor.idRol,
      }),
    );
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

  private mapMeetingDetail(meeting: ReunionEntity) {
    const participantes = [...(meeting.participantes ?? [])]
      .map((participant) => participant.usuario)
      .sort((first, second) => first.nombre.localeCompare(second.nombre))
      .map((usuario) => ({
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        rut: usuario.rut,
        telefono: usuario.telefono,
        roles: [...(usuario.usuarioRoles ?? [])]
          .map((userRole) => ({
            idRol: userRole.rol.idRol,
            nombre: userRole.rol.nombre,
          }))
          .sort((first, second) => first.nombre.localeCompare(second.nombre)),
      }));

    return {
      idReunion: meeting.idReunion,
      fecha: meeting.fecha,
      horaInicio: meeting.horaInicio,
      horaFin: meeting.horaFin,
      lugar: meeting.lugar,
      estado: meeting.estado,
      modalidad: meeting.modalidad,
      participantIds: participantes.map((participant) => participant.idUsuario),
      participantes,
      hasActa: Boolean(meeting.acta),
      acta: meeting.acta
        ? {
            idActa: meeting.acta.idActa,
            texto: meeting.acta.texto,
            fechaActualizacion: meeting.acta.fechaActualizacion,
            actualizadoPor: {
              idUsuario: meeting.acta.actualizadoPor.idUsuario,
              nombre: meeting.acta.actualizadoPor.nombre,
            },
            rol: {
              idRol: meeting.acta.rol.idRol,
              nombre: meeting.acta.rol.nombre,
            },
          }
        : null,
    };
  }
}
