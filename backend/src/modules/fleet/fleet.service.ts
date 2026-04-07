import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryFailedError, Repository } from 'typeorm';
import {
  BoteEntity,
  EstadoBoteEntity,
  TipoBoteEntity,
} from '../../database/entities';
import { CreateBoatDto } from './dto/create-boat.dto';
import { ListBoatsQueryDto } from './dto/list-boats-query.dto';
import { UpdateBoatDto } from './dto/update-boat.dto';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(BoteEntity)
    private readonly boatsRepository: Repository<BoteEntity>,
    @InjectRepository(TipoBoteEntity)
    private readonly boatTypesRepository: Repository<TipoBoteEntity>,
    @InjectRepository(EstadoBoteEntity)
    private readonly boatStatesRepository: Repository<EstadoBoteEntity>,
  ) {}

  async findCatalogs() {
    const [tiposBote, estadosBote] = await Promise.all([
      this.boatTypesRepository.find({
        where: { activo: true },
        order: {
          orden: 'ASC',
          nombre: 'ASC',
        },
      }),
      this.boatStatesRepository.find({
        where: { activo: true },
        order: {
          nombre: 'ASC',
        },
      }),
    ]);

    return {
      tiposBote: tiposBote.map((tipoBote) => this.mapBoatType(tipoBote)),
      estadosBote: estadosBote.map((estadoBote) =>
        this.mapBoatState(estadoBote),
      ),
    };
  }

  async findAll(query: ListBoatsQueryDto) {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 50);
    const search = query.search?.trim().toLowerCase() ?? '';
    const tokens = search.split(/\s+/).filter(Boolean);

    const queryBuilder = this.boatsRepository
      .createQueryBuilder('bote')
      .innerJoinAndSelect('bote.tipoBote', 'tipoBote')
      .innerJoinAndSelect('bote.estadoBote', 'estadoBote');

    if (query.idTipoBote) {
      queryBuilder.andWhere('bote.idTipoBote = :idTipoBote', {
        idTipoBote: query.idTipoBote,
      });
    }

    if (query.idEstadoBote) {
      queryBuilder.andWhere('bote.idEstadoBote = :idEstadoBote', {
        idEstadoBote: query.idEstadoBote,
      });
    }

    if (query.activo !== undefined) {
      queryBuilder.andWhere('bote.activo = :activo', {
        activo: query.activo,
      });
    }

    tokens.forEach((token, index) => {
      queryBuilder.andWhere(
        new Brackets((builder) => {
          builder
            .where(`LOWER(bote.nombre) LIKE :token${index}`, {
              [`token${index}`]: `%${token}%`,
            })
            .orWhere(`LOWER(COALESCE(bote.marca, '')) LIKE :marca${index}`, {
              [`marca${index}`]: `%${token}%`,
            })
            .orWhere(`LOWER(tipoBote.codigo) LIKE :codigo${index}`, {
              [`codigo${index}`]: `%${token}%`,
            })
            .orWhere(`LOWER(tipoBote.nombre) LIKE :tipoNombre${index}`, {
              [`tipoNombre${index}`]: `%${token}%`,
            })
            .orWhere(`LOWER(estadoBote.nombre) LIKE :estado${index}`, {
              [`estado${index}`]: `%${token}%`,
            })
            .orWhere(`CAST(bote.anio AS CHAR) LIKE :anio${index}`, {
              [`anio${index}`]: `%${token}%`,
            });
        }),
      );
    });

    const [boats, total] = await queryBuilder
      .orderBy('bote.activo', 'DESC')
      .addOrderBy('tipoBote.orden', 'ASC')
      .addOrderBy('bote.nombre', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: boats.map((boat) => this.mapBoatSummary(boat)),
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      search: query.search?.trim() ?? '',
      idTipoBote: query.idTipoBote ?? null,
      idEstadoBote: query.idEstadoBote ?? null,
      activo: query.activo ?? null,
    };
  }

  async findOne(id: number) {
    const boat = await this.boatsRepository.findOne({
      where: { idBote: id },
      relations: {
        tipoBote: true,
        estadoBote: true,
      },
    });

    if (!boat) {
      throw new NotFoundException('Bote no encontrado.');
    }

    return this.mapBoatDetail(boat);
  }

  async create(createBoatDto: CreateBoatDto) {
    await this.findBoatTypeOrFail(createBoatDto.idTipoBote, true);
    await this.findBoatStateOrFail(createBoatDto.idEstadoBote, true);

    try {
      const boat = await this.boatsRepository.save(
        this.boatsRepository.create({
          idTipoBote: createBoatDto.idTipoBote,
          idEstadoBote: createBoatDto.idEstadoBote,
          nombre: createBoatDto.nombre.trim(),
          marca: this.normalizeOptionalText(createBoatDto.marca),
          anio: createBoatDto.anio ?? null,
          observacion: this.normalizeOptionalText(createBoatDto.observacion),
          activo: createBoatDto.activo ?? true,
        }),
      );

      return this.findOne(boat.idBote);
    } catch (error) {
      this.handleDuplicateBoatError(error);
      throw error;
    }
  }

  async update(id: number, updateBoatDto: UpdateBoatDto) {
    const currentBoat = await this.boatsRepository.findOneBy({ idBote: id });

    if (!currentBoat) {
      throw new NotFoundException('Bote no encontrado.');
    }

    const idTipoBote = updateBoatDto.idTipoBote ?? currentBoat.idTipoBote;
    const idEstadoBote = updateBoatDto.idEstadoBote ?? currentBoat.idEstadoBote;

    await this.findBoatTypeOrFail(idTipoBote, true);
    await this.findBoatStateOrFail(idEstadoBote, true);

    try {
      await this.boatsRepository.save(
        this.boatsRepository.create({
          idBote: currentBoat.idBote,
          idTipoBote,
          idEstadoBote,
          nombre: updateBoatDto.nombre?.trim() ?? currentBoat.nombre,
          marca:
            updateBoatDto.marca !== undefined
              ? this.normalizeOptionalText(updateBoatDto.marca)
              : currentBoat.marca,
          anio:
            updateBoatDto.anio !== undefined
              ? updateBoatDto.anio
              : currentBoat.anio,
          observacion:
            updateBoatDto.observacion !== undefined
              ? this.normalizeOptionalText(updateBoatDto.observacion)
              : currentBoat.observacion,
          activo: updateBoatDto.activo ?? currentBoat.activo,
        }),
      );

      return this.findOne(id);
    } catch (error) {
      this.handleDuplicateBoatError(error);
      throw error;
    }
  }

  private async findBoatTypeOrFail(idTipoBote: number, requireActive: boolean) {
    const boatType = await this.boatTypesRepository.findOneBy({ idTipoBote });

    if (!boatType) {
      throw new NotFoundException('El tipo de bote indicado no existe.');
    }

    if (requireActive && !boatType.activo) {
      throw new ConflictException(
        'El tipo de bote indicado no se encuentra disponible.',
      );
    }

    return boatType;
  }

  private async findBoatStateOrFail(
    idEstadoBote: number,
    requireActive: boolean,
  ) {
    const boatState = await this.boatStatesRepository.findOneBy({
      idEstadoBote,
    });

    if (!boatState) {
      throw new NotFoundException('El estado de bote indicado no existe.');
    }

    if (requireActive && !boatState.activo) {
      throw new ConflictException(
        'El estado de bote indicado no se encuentra disponible.',
      );
    }

    return boatState;
  }

  private normalizeOptionalText(value?: string | null) {
    const normalizedValue = value?.trim();

    return normalizedValue ? normalizedValue : null;
  }

  private handleDuplicateBoatError(error: unknown) {
    const driverError =
      error instanceof QueryFailedError &&
      typeof error.driverError === 'object' &&
      error.driverError !== null
        ? (error.driverError as Record<string, unknown>)
        : null;

    if (
      error instanceof QueryFailedError &&
      driverError &&
      driverError.code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException('Ya existe un bote con ese nombre.');
    }
  }

  private mapBoatSummary(boat: BoteEntity) {
    return {
      idBote: boat.idBote,
      nombre: boat.nombre,
      marca: boat.marca,
      anio: boat.anio,
      activo: boat.activo,
      tipoBote: this.mapBoatType(boat.tipoBote),
      estadoBote: this.mapBoatState(boat.estadoBote),
    };
  }

  private mapBoatDetail(boat: BoteEntity) {
    return {
      ...this.mapBoatSummary(boat),
      observacion: boat.observacion,
    };
  }

  private mapBoatType(boatType: TipoBoteEntity) {
    return {
      idTipoBote: boatType.idTipoBote,
      codigo: boatType.codigo,
      nombre: boatType.nombre,
      requiereTimonel: boatType.requiereTimonel,
      orden: boatType.orden,
      activo: boatType.activo,
    };
  }

  private mapBoatState(boatState: EstadoBoteEntity) {
    return {
      idEstadoBote: boatState.idEstadoBote,
      nombre: boatState.nombre,
      permiteUso: boatState.permiteUso,
      activo: boatState.activo,
    };
  }
}
