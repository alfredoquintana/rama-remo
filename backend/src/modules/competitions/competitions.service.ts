import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  BoteEntity,
  CategoriaEntity,
  ClubEntity,
  CompetenciaEntity,
  CompetenciaInscripcionEntity,
  CompetenciaInscripcionIntegranteEntity,
  CompetenciaPruebaEntity,
  DeportistaEntity,
  EstadoCompetencia,
  EstadoInscripcionCompetencia,
  OrigenCompetencia,
  OrigenDatoPrueba,
  TipoBoteEntity,
  TipoCompetencia,
} from '../../database/entities';
import {
  normalizeCodeText,
  normalizeFreeText,
  normalizeLabelText,
  normalizePersonName,
} from '../../common/text.util';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { CreateCompetitionTestDto } from './dto/create-competition-test.dto';
import {
  CompetitionRegistrationMemberDto,
  UpdateCompetitionRegistrationDto,
} from './dto/update-competition-registration.dto';
import { UpdateCompetitionTestDto } from './dto/update-competition-test.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CompetitionCatalogsService } from './competition-catalogs.service';
import {
  COMPETITION_TEST_DISTANCE_OPTIONS,
  COMPETITION_TEST_MODALITY_OPTIONS,
} from './competition-options';

@Injectable()
export class CompetitionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly competitionCatalogsService: CompetitionCatalogsService,
    @InjectRepository(ClubEntity)
    private readonly clubsRepository: Repository<ClubEntity>,
    @InjectRepository(CompetenciaEntity)
    private readonly competitionsRepository: Repository<CompetenciaEntity>,
    @InjectRepository(CompetenciaPruebaEntity)
    private readonly competitionTestsRepository: Repository<CompetenciaPruebaEntity>,
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
    return this.competitionCatalogsService.findCatalogs();
  }

  async findAll() {
    const competitions = await this.competitionsRepository.find({
      relations: {
        pruebas: { inscripciones: true },
      },
      order: { fechaInicio: 'DESC', fechaFin: 'DESC', nombre: 'ASC' },
    });

    return competitions.map((item) => ({
      idCompetencia: item.idCompetencia,
      nombre: item.nombre,
      tipoCompetencia: item.tipoCompetencia,
      origen: item.origen,
      organizador: item.organizador,
      sede: item.sede,
      fechaInicio: item.fechaInicio,
      fechaFin: item.fechaFin,
      estado: item.estado,
      observacion: item.observacion,
      resumen: {
        pruebas: item.pruebas?.length ?? 0,
        inscripciones:
          item.pruebas?.filter((test) => (test.inscripciones?.length ?? 0) > 0)
            .length ?? 0,
      },
    }));
  }

  async findOne(id: number) {
    const competition = await this.competitionsRepository.findOne({
      where: { idCompetencia: id },
      relations: {
        club: true,
        pruebas: {
          categoria: true,
          tipoBote: true,
          inscripciones: {
            bote: { tipoBote: true, estadoBote: true },
            integrantes: true,
          },
        },
      },
    });

    if (!competition) {
      throw new NotFoundException('Competencia no encontrada.');
    }

    return this.mapCompetitionDetail(competition);
  }

  async create(createCompetitionDto: CreateCompetitionDto) {
    const club = await this.findDefaultClubOrFail();
    const payload = this.normalizeCompetitionPayload(createCompetitionDto);
    const competition = await this.competitionsRepository.save(
      this.competitionsRepository.create({
        idClub: club.idClub,
        ...payload,
        origen: OrigenCompetencia.MANUAL,
      }),
    );

    return this.findOne(competition.idCompetencia);
  }

  async update(id: number, dto: UpdateCompetitionDto) {
    const current = await this.findCompetitionOrFail(id);
    const payload = this.normalizeCompetitionPayload({
      nombre: dto.nombre ?? current.nombre,
      tipoCompetencia: dto.tipoCompetencia ?? current.tipoCompetencia,
      fechaInicio: dto.fechaInicio ?? current.fechaInicio,
      fechaFin: dto.fechaFin ?? current.fechaFin,
      estado: dto.estado ?? current.estado,
      organizador:
        dto.organizador !== undefined
          ? dto.organizador
          : (current.organizador ?? undefined),
      sede: dto.sede !== undefined ? dto.sede : (current.sede ?? undefined),
      observacion:
        dto.observacion !== undefined
          ? dto.observacion
          : (current.observacion ?? undefined),
    });

    await this.ensureTestsRemainWithinCompetitionWindow(
      id,
      payload.fechaInicio,
      payload.fechaFin,
    );

    await this.competitionsRepository.save(
      this.competitionsRepository.create({
        idCompetencia: current.idCompetencia,
        idClub: current.idClub,
        origen: current.origen,
        ...payload,
      }),
    );

    if (payload.tipoCompetencia === TipoCompetencia.ERGOMETRO) {
      const tests = await this.competitionTestsRepository.findBy({
        idCompetencia: id,
      });
      if (tests.length > 0) {
        await this.competitionTestsRepository.save(
          tests.map((test) => ({
            ...test,
            requiereBote: false,
            idTipoBote: null,
            requiereTimonel: false,
          })),
        );
      }
    }

    return this.findOne(id);
  }

  async createTest(id: number, dto: CreateCompetitionTestDto) {
    const competition = await this.findCompetitionOrFail(id);
    const payload = await this.normalizeTestPayload(
      dto,
      competition.tipoCompetencia,
      competition.fechaInicio,
      competition.fechaFin,
      OrigenDatoPrueba.MANUAL,
    );

    await this.competitionTestsRepository.save(
      this.competitionTestsRepository.create({
        idCompetencia: id,
        ...payload,
      }),
    );

    return this.findOne(id);
  }

  async updateTest(testId: number, dto: UpdateCompetitionTestDto) {
    const current = await this.competitionTestsRepository.findOne({
      where: { idCompetenciaPrueba: testId },
      relations: { competencia: true },
    });

    if (!current) {
      throw new NotFoundException('Prueba no encontrada.');
    }

    const payload = await this.normalizeTestPayload(
      {
        numeroPrueba: dto.numeroPrueba ?? current.numeroPrueba,
        ordenPrueba: dto.ordenPrueba ?? current.ordenPrueba,
        nombrePrueba: dto.nombrePrueba ?? current.nombrePrueba,
        idCategoria:
          dto.idCategoria !== undefined
            ? (dto.idCategoria ?? undefined)
            : (current.idCategoria ?? undefined),
        categoriaOrigen:
          dto.categoriaOrigen !== undefined
            ? dto.categoriaOrigen
            : (current.categoriaOrigen ?? undefined),
        generoOrigen:
          dto.generoOrigen !== undefined
            ? dto.generoOrigen
            : (current.generoOrigen ?? undefined),
        modalidadOrigen:
          dto.modalidadOrigen !== undefined
            ? dto.modalidadOrigen
            : (current.modalidadOrigen ?? undefined),
        tipoBoteOrigen:
          dto.tipoBoteOrigen !== undefined
            ? dto.tipoBoteOrigen
            : (current.tipoBoteOrigen ?? undefined),
        idTipoBote:
          dto.idTipoBote !== undefined
            ? (dto.idTipoBote ?? undefined)
            : (current.idTipoBote ?? undefined),
        distancia:
          dto.distancia !== undefined
            ? (dto.distancia ?? undefined)
            : (current.distancia ?? undefined),
        fecha:
          dto.fecha !== undefined
            ? (dto.fecha ?? undefined)
            : (current.fecha ?? undefined),
        hora:
          dto.hora !== undefined
            ? (dto.hora ?? undefined)
            : (current.hora?.slice(0, 5) ?? undefined),
        requiereBote: dto.requiereBote ?? current.requiereBote,
        cantidadTripulantesEsperada:
          dto.cantidadTripulantesEsperada !== undefined
            ? (dto.cantidadTripulantesEsperada ?? undefined)
            : (current.cantidadTripulantesEsperada ?? undefined),
        requiereTimonel: dto.requiereTimonel ?? current.requiereTimonel,
        esMaster: dto.esMaster ?? current.esMaster,
        observacion:
          dto.observacion !== undefined
            ? (dto.observacion ?? undefined)
            : (current.observacion ?? undefined),
      },
      current.competencia.tipoCompetencia,
      current.competencia.fechaInicio,
      current.competencia.fechaFin,
      OrigenDatoPrueba.EDITADA,
    );

    await this.competitionTestsRepository.save(
      this.competitionTestsRepository.create({
        idCompetenciaPrueba: current.idCompetenciaPrueba,
        idCompetencia: current.idCompetencia,
        ...payload,
      }),
    );

    return this.findOne(current.idCompetencia);
  }

  async updateRegistration(
    testId: number,
    dto: UpdateCompetitionRegistrationDto,
  ) {
    const test = await this.competitionTestsRepository.findOne({
      where: { idCompetenciaPrueba: testId },
      relations: {
        competencia: true,
        categoria: true,
        inscripciones: { integrantes: true },
      },
    });

    if (!test) {
      throw new NotFoundException('Prueba no encontrada.');
    }

    const current = test.inscripciones?.[0] ?? null;
    const members = await this.buildRegistrationMembers(
      dto.integrantes,
      test.competencia.fechaInicio,
      test.esMaster,
      test.idCategoria,
      test.categoriaOrigen,
    );
    const status = this.normalizeRegistrationStatus(
      dto.estado ?? current?.estado,
    );
    const boatId =
      dto.idBote !== undefined
        ? (dto.idBote ?? null)
        : (current?.idBote ?? null);
    const boat = boatId ? await this.validateBoatForTest(boatId, test) : null;
    const masterData = this.calculateMasterData(members, test.esMaster);

    this.validateRegistrationState(test, status, members, boat);

    await this.dataSource.transaction(async (manager) => {
      const registrationsRepository = manager.getRepository(
        CompetenciaInscripcionEntity,
      );
      const membersRepository = manager.getRepository(
        CompetenciaInscripcionIntegranteEntity,
      );

      const savedRegistration = await registrationsRepository.save(
        registrationsRepository.create({
          idCompetenciaInscripcion: current?.idCompetenciaInscripcion,
          idCompetenciaPrueba: testId,
          idBote: boat?.idBote ?? null,
          estado: status,
          promedioEdad: masterData.promedioEdad,
          categoriaMasterEstimada: masterData.categoriaMasterEstimada,
        }),
      );

      if (current) {
        await membersRepository.delete({
          idCompetenciaInscripcion: current.idCompetenciaInscripcion,
        });
      }

      if (members.length > 0) {
        await membersRepository.save(
          members.map((member) =>
            membersRepository.create({
              idCompetenciaInscripcion:
                savedRegistration.idCompetenciaInscripcion,
              ...member,
            }),
          ),
        );
      }
    });

    return this.findOne(test.idCompetencia);
  }

  private async findDefaultClubOrFail() {
    const club = await this.clubsRepository.findOne({
      where: { activo: true },
      order: { idClub: 'ASC' },
    });

    if (!club) {
      throw new NotFoundException(
        'No existe un club configurado para registrar competencias.',
      );
    }

    return club;
  }

  private async findCompetitionOrFail(id: number) {
    const competition = await this.competitionsRepository.findOneBy({
      idCompetencia: id,
    });

    if (!competition) {
      throw new NotFoundException('Competencia no encontrada.');
    }

    return competition;
  }

  private normalizeCompetitionPayload(payload: Partial<CreateCompetitionDto>) {
    const nombre = normalizeLabelText(payload.nombre ?? '');

    if (!nombre) {
      throw new BadRequestException(
        'No puedes registrar una competencia sin nombre.',
      );
    }

    if (!payload.tipoCompetencia) {
      throw new BadRequestException('Debes indicar el tipo de competencia.');
    }

    if (!payload.fechaInicio || !payload.fechaFin) {
      throw new BadRequestException(
        'Debes informar fecha de inicio y fecha de fin para la competencia.',
      );
    }

    if (payload.fechaFin < payload.fechaInicio) {
      throw new BadRequestException(
        'La fecha de término no puede ser anterior a la fecha de inicio.',
      );
    }

    return {
      nombre,
      tipoCompetencia: payload.tipoCompetencia,
      organizador: this.normalizeOptionalText(payload.organizador, 'label'),
      sede: this.normalizeOptionalText(payload.sede, 'label'),
      fechaInicio: payload.fechaInicio,
      fechaFin: payload.fechaFin,
      estado: payload.estado ?? EstadoCompetencia.BORRADOR,
      observacion: this.normalizeOptionalText(payload.observacion),
    };
  }

  private async normalizeTestPayload(
    payload: Partial<CreateCompetitionTestDto>,
    competitionType: TipoCompetencia,
    competitionStartDate: string,
    competitionEndDate: string,
    origenDato: OrigenDatoPrueba,
  ) {
    const nombrePrueba = normalizeLabelText(payload.nombrePrueba ?? '');

    if (!nombrePrueba) {
      throw new BadRequestException(
        'No puedes registrar una prueba sin nombre.',
      );
    }

    if (!payload.numeroPrueba || !payload.ordenPrueba) {
      throw new BadRequestException('La prueba debe incluir número y orden.');
    }

    if (
      payload.distancia != null &&
      !COMPETITION_TEST_DISTANCE_OPTIONS.includes(
        payload.distancia as (typeof COMPETITION_TEST_DISTANCE_OPTIONS)[number],
      )
    ) {
      throw new BadRequestException(
        'La distancia indicada no forma parte de las opciones permitidas.',
      );
    }

    if (
      payload.modalidadOrigen &&
      !COMPETITION_TEST_MODALITY_OPTIONS.includes(
        payload.modalidadOrigen as (typeof COMPETITION_TEST_MODALITY_OPTIONS)[number],
      )
    ) {
      throw new BadRequestException(
        'La modalidad indicada no forma parte de las opciones permitidas.',
      );
    }

    if (
      payload.fecha &&
      (payload.fecha < competitionStartDate ||
        payload.fecha > competitionEndDate)
    ) {
      throw new BadRequestException(
        'La fecha de la prueba debe estar dentro del rango definido para la competencia.',
      );
    }

    const category =
      payload.idCategoria != null
        ? await this.findCategoryOrFail(payload.idCategoria)
        : payload.categoriaOrigen
          ? await this.findCategoryByName(payload.categoriaOrigen)
          : null;
    const boatType =
      payload.idTipoBote != null
        ? await this.findBoatTypeOrFail(payload.idTipoBote)
        : null;
    const derived = boatType ? this.deriveCrewInfo(boatType) : null;

    if (competitionType === TipoCompetencia.ERGOMETRO && payload.requiereBote) {
      throw new ConflictException(
        'Las pruebas de ergómetro no requieren bote.',
      );
    }

    return {
      numeroPrueba: payload.numeroPrueba,
      ordenPrueba: payload.ordenPrueba,
      nombrePrueba,
      idCategoria: category?.idCategoria ?? null,
      categoriaOrigen:
        category?.nombre ??
        this.normalizeOptionalText(payload.categoriaOrigen, 'label'),
      generoOrigen: this.normalizeOptionalText(payload.generoOrigen, 'label'),
      modalidadOrigen: this.normalizeOptionalText(
        payload.modalidadOrigen,
        'label',
      ),
      tipoBoteOrigen: this.normalizeOptionalText(
        payload.tipoBoteOrigen,
        'code',
      ),
      idTipoBote: boatType?.idTipoBote ?? null,
      distancia: payload.distancia ?? null,
      fecha: payload.fecha ?? null,
      hora: payload.hora ? `${payload.hora}:00` : null,
      requiereBote:
        competitionType === TipoCompetencia.ERGOMETRO
          ? false
          : derived
            ? true
            : (payload.requiereBote ?? true),
      cantidadTripulantesEsperada:
        derived?.cantidadTripulantesEsperada ??
        payload.cantidadTripulantesEsperada ??
        null,
      requiereTimonel:
        derived?.requiereTimonel ?? payload.requiereTimonel ?? false,
      esMaster: payload.esMaster ?? false,
      observacion: this.normalizeOptionalText(payload.observacion),
      origenDato,
    };
  }

  private async findBoatTypeOrFail(idTipoBote: number) {
    const boatType = await this.boatTypesRepository.findOneBy({
      idTipoBote,
      activo: true,
    });

    if (!boatType) {
      throw new NotFoundException(
        'El tipo de bote indicado no existe o está inactivo.',
      );
    }

    return boatType;
  }

  private async findCategoryOrFail(idCategoria: number) {
    const category = await this.categoriesRepository.findOneBy({
      idCategoria,
      activa: true,
    });

    if (!category) {
      throw new NotFoundException(
        'La categoria indicada no existe o esta inactiva.',
      );
    }

    return category;
  }

  private async findCategoryByName(name: string) {
    const normalizedName = normalizeLabelText(name);

    if (!normalizedName) {
      return null;
    }

    const categories = await this.categoriesRepository.find({
      where: { activa: true },
      select: {
        idCategoria: true,
        nombre: true,
        edadMin: true,
        edadMax: true,
        orden: true,
        activa: true,
      },
    });

    return (
      categories.find(
        (item) => normalizeLabelText(item.nombre) === normalizedName,
      ) ?? null
    );
  }

  private async ensureTestsRemainWithinCompetitionWindow(
    competitionId: number,
    startDate: string,
    endDate: string,
  ) {
    const tests = await this.competitionTestsRepository.find({
      where: { idCompetencia: competitionId },
      select: {
        idCompetenciaPrueba: true,
        fecha: true,
        nombrePrueba: true,
      },
    });

    const invalidTest = tests.find(
      (test) => test.fecha && (test.fecha < startDate || test.fecha > endDate),
    );

    if (invalidTest) {
      throw new ConflictException(
        `No puedes acotar la competencia porque la prueba "${invalidTest.nombrePrueba}" queda fuera del rango de fechas.`,
      );
    }
  }

  private deriveCrewInfo(boatType: TipoBoteEntity) {
    const match = boatType.codigo.match(/^(\d+)/);
    const baseCrew = match ? Number(match[1]) : null;

    return {
      cantidadTripulantesEsperada:
        baseCrew == null
          ? null
          : boatType.requiereTimonel
            ? baseCrew + 1
            : baseCrew,
      requiereTimonel: boatType.requiereTimonel,
    };
  }

  private async validateBoatForTest(
    boatId: number,
    test: CompetenciaPruebaEntity,
  ) {
    const boat = await this.boatsRepository.findOne({
      where: { idBote: boatId },
      relations: { tipoBote: true, estadoBote: true },
    });

    if (!boat) {
      throw new NotFoundException('El bote asignado no existe.');
    }

    if (!boat.activo) {
      throw new ConflictException('No puedes asignar un bote inactivo.');
    }

    if (!boat.estadoBote?.permiteUso) {
      throw new ConflictException(
        'El bote asignado no se encuentra disponible.',
      );
    }

    if (test.idTipoBote && boat.idTipoBote !== test.idTipoBote) {
      throw new ConflictException(
        'El bote asignado no coincide con el tipo de bote normalizado de la prueba.',
      );
    }

    return boat;
  }

  private async buildRegistrationMembers(
    members: CompetitionRegistrationMemberDto[],
    competitionDate: string,
    isMaster: boolean,
    testCategoryId: number | null,
    testCategory: string | null,
  ) {
    const ids = members.map((item) => item.idDeportista);
    const athletes =
      ids.length === 0
        ? []
        : await this.athletesRepository.find({
            where: { idDeportista: In(ids), activo: true },
            relations: { usuario: true, categorias: { categoria: true } },
          });
    const athletesById = new Map(
      athletes.map((item) => [item.idDeportista, item] as const),
    );
    const seenAthletes = new Set<number>();
    const seenOrders = new Set<number>();
    const year = Number(competitionDate.slice(0, 4));

    return members
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((member) => {
        if (seenAthletes.has(member.idDeportista)) {
          throw new ConflictException(
            'No puedes repetir un mismo deportista dentro de la misma inscripción.',
          );
        }

        if (seenOrders.has(member.orden)) {
          throw new ConflictException(
            'Cada integrante debe tener un orden único dentro de la inscripción.',
          );
        }

        seenAthletes.add(member.idDeportista);
        seenOrders.add(member.orden);

        const athlete = athletesById.get(member.idDeportista);
        if (!athlete?.usuario) {
          throw new NotFoundException(
            'Uno de los deportistas seleccionados no existe o no está activo.',
          );
        }

        const currentCategory = this.resolveCurrentAthleteCategory(athlete);
        const normalizedTestCategoryId = testCategoryId ?? null;
        const normalizedTestCategory = normalizeLabelText(testCategory ?? '');
        const normalizedAthleteCategory = normalizeLabelText(
          currentCategory?.nombre ?? '',
        );

        if (
          normalizedTestCategoryId != null &&
          currentCategory?.idCategoria !== normalizedTestCategoryId
        ) {
          throw new ConflictException(
            `El deportista "${normalizePersonName(athlete.usuario.nombre)}" no pertenece a la categoria vigente de la prueba.`,
          );
        }

        if (
          normalizedTestCategoryId == null &&
          normalizedTestCategory &&
          normalizedAthleteCategory !== normalizedTestCategory
        ) {
          throw new ConflictException(
            `El deportista "${normalizePersonName(athlete.usuario.nombre)}" no pertenece a la categoria vigente de la prueba.`,
          );
        }

        const age = Math.max(
          year - Number(athlete.usuario.fechaNac.slice(0, 4)),
          0,
        );

        return {
          idDeportista: athlete.idDeportista,
          orden: member.orden,
          esTimonel: member.esTimonel ?? false,
          rolTexto: this.normalizeOptionalText(member.rolTexto, 'label'),
          snapshotNombre: normalizePersonName(athlete.usuario.nombre),
          snapshotRut: normalizeCodeText(athlete.usuario.rut),
          snapshotFechaNacimiento: athlete.usuario.fechaNac,
          edadCompetencia: age,
          categoriaMasterIndividual: isMaster
            ? this.resolveMasterCategory(age)
            : null,
          observacion: this.normalizeOptionalText(member.observacion),
        };
      });
  }

  private validateRegistrationState(
    test: CompetenciaPruebaEntity,
    status: EstadoInscripcionCompetencia,
    members: Array<{ esTimonel: boolean }>,
    boat: BoteEntity | null,
  ) {
    if (
      status === EstadoInscripcionCompetencia.NOMINATIVA &&
      members.length === 0
    ) {
      throw new ConflictException(
        'Una inscripción nominativa debe tener al menos un integrante.',
      );
    }

    if (test.requiereTimonel && !members.some((member) => member.esTimonel)) {
      throw new ConflictException(
        'La prueba requiere timonel y la inscripción no tiene uno.',
      );
    }

    if (!test.requiereTimonel && members.some((member) => member.esTimonel)) {
      throw new ConflictException('La prueba no requiere timonel.');
    }

    if (
      status === EstadoInscripcionCompetencia.NOMINATIVA &&
      test.cantidadTripulantesEsperada &&
      members.length !== test.cantidadTripulantesEsperada
    ) {
      throw new ConflictException(
        'La inscripción nominativa no coincide con la cantidad esperada de tripulantes.',
      );
    }

    if (
      status === EstadoInscripcionCompetencia.NOMINATIVA &&
      test.requiereBote &&
      !boat
    ) {
      throw new ConflictException(
        'La inscripción nominativa requiere un bote asignado.',
      );
    }
  }

  private normalizeRegistrationStatus(
    value?: string | null,
  ): EstadoInscripcionCompetencia {
    if (
      value === EstadoInscripcionCompetencia.NOMINATIVA ||
      value === 'lista'
    ) {
      return EstadoInscripcionCompetencia.NOMINATIVA;
    }

    return EstadoInscripcionCompetencia.PRESUNTIVA;
  }

  private calculateMasterData(
    members: Array<{ edadCompetencia: number }>,
    isMaster: boolean,
  ) {
    if (!isMaster || members.length === 0) {
      return { promedioEdad: null, categoriaMasterEstimada: null };
    }

    const average =
      members.reduce((sum, item) => sum + item.edadCompetencia, 0) /
      members.length;

    return {
      promedioEdad: average.toFixed(2),
      categoriaMasterEstimada: this.resolveMasterCategory(Math.round(average)),
    };
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

  private resolveMasterCategory(age: number) {
    if (age < 27) return null;
    if (age <= 35) return 'A';
    if (age <= 42) return 'B';
    if (age <= 49) return 'C';
    if (age <= 54) return 'D';
    if (age <= 59) return 'E';
    if (age <= 64) return 'F';
    if (age <= 69) return 'G';
    if (age <= 74) return 'H';
    if (age <= 79) return 'I';
    return 'J';
  }

  private mapCompetitionDetail(competition: CompetenciaEntity) {
    const tests = [...(competition.pruebas ?? [])].sort((a, b) =>
      a.ordenPrueba === b.ordenPrueba
        ? a.numeroPrueba - b.numeroPrueba
        : a.ordenPrueba - b.ordenPrueba,
    );

    return {
      idCompetencia: competition.idCompetencia,
      club: competition.club
        ? { idClub: competition.club.idClub, nombre: competition.club.nombre }
        : null,
      nombre: competition.nombre,
      tipoCompetencia: competition.tipoCompetencia,
      origen: competition.origen,
      organizador: competition.organizador,
      sede: competition.sede,
      fechaInicio: competition.fechaInicio,
      fechaFin: competition.fechaFin,
      estado: competition.estado,
      observacion: competition.observacion,
      fechaCreacion: competition.fechaCreacion,
      fechaActualizacion: competition.fechaActualizacion,
      resumen: {
        pruebas: tests.length,
        inscripciones: tests.filter(
          (item) => (item.inscripciones?.length ?? 0) > 0,
        ).length,
      },
      pruebas: tests.map((test) => {
        const registration = (test.inscripciones ?? [])[0] ?? null;
        return {
          idCompetenciaPrueba: test.idCompetenciaPrueba,
          numeroPrueba: test.numeroPrueba,
          ordenPrueba: test.ordenPrueba,
          nombrePrueba: test.nombrePrueba,
          categoria: test.categoria
            ? {
                idCategoria: test.categoria.idCategoria,
                nombre: test.categoria.nombre,
                edadMin: test.categoria.edadMin,
                edadMax: test.categoria.edadMax,
                orden: test.categoria.orden,
                activa: test.categoria.activa,
              }
            : null,
          categoriaOrigen: test.categoriaOrigen,
          generoOrigen: test.generoOrigen,
          modalidadOrigen: test.modalidadOrigen,
          tipoBoteOrigen: test.tipoBoteOrigen,
          tipoBoteNormalizado: test.tipoBote
            ? {
                idTipoBote: test.tipoBote.idTipoBote,
                codigo: test.tipoBote.codigo,
                nombre: test.tipoBote.nombre,
                requiereTimonel: test.tipoBote.requiereTimonel,
              }
            : null,
          distancia: test.distancia,
          fecha: test.fecha,
          hora: test.hora?.slice(0, 5) ?? null,
          requiereBote: test.requiereBote,
          cantidadTripulantesEsperada: test.cantidadTripulantesEsperada,
          requiereTimonel: test.requiereTimonel,
          esMaster: test.esMaster,
          observacion: test.observacion,
          origenDato: test.origenDato,
          inscripcion: registration
            ? {
                idCompetenciaInscripcion: registration.idCompetenciaInscripcion,
                estado: this.normalizeRegistrationStatus(registration.estado),
                promedioEdad:
                  registration.promedioEdad == null
                    ? null
                    : Number(registration.promedioEdad),
                categoriaMasterEstimada: registration.categoriaMasterEstimada,
                bote: registration.bote
                  ? {
                      idBote: registration.bote.idBote,
                      nombre: registration.bote.nombre,
                      tipoBote: registration.bote.tipoBote
                        ? {
                            idTipoBote: registration.bote.tipoBote.idTipoBote,
                            codigo: registration.bote.tipoBote.codigo,
                            nombre: registration.bote.tipoBote.nombre,
                          }
                        : null,
                    }
                  : null,
                integrantes: [...(registration.integrantes ?? [])]
                  .sort((a, b) => a.orden - b.orden)
                  .map((member) => ({
                    idCompetenciaInscripcionIntegrante:
                      member.idCompetenciaInscripcionIntegrante,
                    idDeportista: member.idDeportista,
                    orden: member.orden,
                    esTimonel: member.esTimonel,
                    rolTexto: member.rolTexto,
                    snapshotNombre: member.snapshotNombre,
                    snapshotRut: member.snapshotRut,
                    snapshotFechaNacimiento: member.snapshotFechaNacimiento,
                    edadCompetencia: member.edadCompetencia,
                    categoriaMasterIndividual: member.categoriaMasterIndividual,
                    observacion: member.observacion,
                  })),
              }
            : null,
        };
      }),
    };
  }

  private normalizeOptionalText(
    value?: string | null,
    mode: 'label' | 'free' | 'code' = 'free',
  ) {
    if (value == null || value === '') {
      return null;
    }

    const normalizedValue =
      mode === 'label'
        ? normalizeLabelText(value)
        : mode === 'code'
          ? normalizeCodeText(value)
          : normalizeFreeText(value);

    return normalizedValue || null;
  }
}
