import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BoteEntity,
  CategoriaEntity,
  ClubEntity,
  DeportistaEntity,
  EstadoCompetencia,
  EstadoInscripcionCompetencia,
  TipoBoteEntity,
  TipoCompetencia,
} from '../../database/entities';
import {
  COMPETITION_TEST_DISTANCE_OPTIONS,
  COMPETITION_TEST_MODALITY_OPTIONS,
} from './competition-options';

@Injectable()
export class CompetitionCatalogsService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubsRepository: Repository<ClubEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriesRepository: Repository<CategoriaEntity>,
    @InjectRepository(DeportistaEntity)
    private readonly athletesRepository: Repository<DeportistaEntity>,
    @InjectRepository(BoteEntity)
    private readonly boatsRepository: Repository<BoteEntity>,
    @InjectRepository(TipoBoteEntity)
    private readonly boatTypesRepository: Repository<TipoBoteEntity>,
  ) {}

  async findCatalogs() {
    const club = await this.findDefaultClubOrFail();
    const [boatTypes, boats, athletes, categories] = await Promise.all([
      this.boatTypesRepository.find({
        where: { activo: true },
        order: { orden: 'ASC', nombre: 'ASC' },
      }),
      this.boatsRepository.find({
        where: { activo: true },
        relations: { tipoBote: true, estadoBote: true },
        order: { nombre: 'ASC' },
      }),
      this.athletesRepository.find({
        where: { activo: true },
        relations: { usuario: true, categorias: { categoria: true } },
      }),
      this.categoriesRepository.find({
        where: { activa: true },
        order: { orden: 'ASC', nombre: 'ASC' },
      }),
    ]);

    return {
      club: { idClub: club.idClub, nombre: club.nombre },
      tiposCompetencia: Object.values(TipoCompetencia),
      estadosCompetencia: Object.values(EstadoCompetencia),
      estadosInscripcion: Object.values(EstadoInscripcionCompetencia),
      categorias: categories.map((item) => ({
        idCategoria: item.idCategoria,
        nombre: item.nombre,
        edadMin: item.edadMin,
        edadMax: item.edadMax,
        orden: item.orden,
        activa: item.activa,
      })),
      modalidadesPrueba: [...COMPETITION_TEST_MODALITY_OPTIONS],
      distanciasPrueba: [...COMPETITION_TEST_DISTANCE_OPTIONS],
      tiposBote: boatTypes.map((item) => ({
        idTipoBote: item.idTipoBote,
        codigo: item.codigo,
        nombre: item.nombre,
        requiereTimonel: item.requiereTimonel,
      })),
      botes: boats
        .filter((item) => item.estadoBote?.permiteUso)
        .map((item) => ({
          idBote: item.idBote,
          nombre: item.nombre,
          tipoBote: item.tipoBote
            ? {
                idTipoBote: item.tipoBote.idTipoBote,
                codigo: item.tipoBote.codigo,
                nombre: item.tipoBote.nombre,
              }
            : null,
        })),
      deportistas: athletes
        .map((item) => ({
          idDeportista: item.idDeportista,
          nombre: item.usuario.nombre,
          rut: item.usuario.rut,
          fechaNacimiento: item.usuario.fechaNac,
          categoriaVigente: this.resolveCurrentAthleteCategory(item),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    };
  }

  private async findDefaultClubOrFail() {
    const club = await this.clubsRepository.findOne({
      where: { activo: true },
      order: { idClub: 'ASC' },
    });

    if (!club) {
      throw new NotFoundException('No existe un club activo configurado.');
    }

    return club;
  }

  private resolveCurrentAthleteCategory(athlete: DeportistaEntity) {
    const currentCategory = [...(athlete.categorias ?? [])]
      .filter(
        (item) => item.vigente && item.fechaHasta == null && item.categoria,
      )
      .sort((first, second) =>
        second.fechaDesde.localeCompare(first.fechaDesde),
      )[0];

    return currentCategory?.categoria
      ? {
          idCategoria: currentCategory.categoria.idCategoria,
          nombre: currentCategory.categoria.nombre,
        }
      : null;
  }
}
