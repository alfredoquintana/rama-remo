import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ActaEntity,
  EstadoBoteEntity,
  CategoriaEntity,
  ClubEntity,
  DeportistaCategoriaEntity,
  DeportistaEntity,
  EstadoPlanAnual,
  EstadoPlanItem,
  EstadoReunion,
  ItemEntity,
  MenuEntity,
  MenuRolEntity,
  ModalidadReunion,
  ParticipanteReunionEntity,
  PlanAnualEntity,
  PlanAreaEntity,
  PlanItemEntity,
  PlanSeguimientoEntity,
  PrioridadPlanItem,
  ReunionEntity,
  RolEntity,
  TipoBoteEntity,
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { hashPassword } from '../auth/password.util';
import {
  buildClubAthleteSeedUsers,
  CATEGORY_SEED_DEFINITIONS,
} from './athlete-seed.data';

const ROLE_NAMES = [
  'admin',
  'presidente',
  'vicepresidente',
  'secretario',
  'tesorero',
  'director',
  'apoderado',
  'deportista',
  'entrenador',
] as const;

const MANAGEMENT_ROLE_NAMES = [
  'admin',
  'presidente',
  'vicepresidente',
  'secretario',
  'tesorero',
  'director',
] as const;

const SPORTS_MENU_ROLE_NAMES = [
  'admin',
  'presidente',
  'vicepresidente',
  'secretario',
  'tesorero',
  'director',
  'deportista',
  'entrenador',
] as const;

const FLEET_MENU_ROLE_NAMES = [
  'admin',
  'presidente',
  'vicepresidente',
  'secretario',
  'tesorero',
  'director',
  'entrenador',
] as const;

const COMPETITIONS_MENU_ROLE_NAMES = [
  'admin',
  'presidente',
  'vicepresidente',
  'secretario',
  'tesorero',
  'director',
  'entrenador',
] as const;

const CLUB_SEED_DEFINITION = {
  nombre: 'Club Phoenix',
  activo: true,
  observacion: 'Club base para la gestión interna de la rama de remo.',
} as const;

const BOAT_TYPE_SEED_DEFINITIONS = [
  {
    codigo: '1x',
    nombre: 'Single scull',
    requiereTimonel: false,
    orden: 1,
    activo: true,
  },
  {
    codigo: '2x',
    nombre: 'Doble scull',
    requiereTimonel: false,
    orden: 2,
    activo: true,
  },
  {
    codigo: '2-',
    nombre: 'Dos sin timonel',
    requiereTimonel: false,
    orden: 3,
    activo: true,
  },
  {
    codigo: '2+',
    nombre: 'Dos con timonel',
    requiereTimonel: true,
    orden: 4,
    activo: true,
  },
  {
    codigo: '4x',
    nombre: 'Cuadruple scull',
    requiereTimonel: false,
    orden: 5,
    activo: true,
  },
  {
    codigo: '4-',
    nombre: 'Cuatro sin timonel',
    requiereTimonel: false,
    orden: 6,
    activo: true,
  },
  {
    codigo: '4+',
    nombre: 'Cuatro con timonel',
    requiereTimonel: true,
    orden: 7,
    activo: true,
  },
  {
    codigo: '8+',
    nombre: 'Ocho con timonel',
    requiereTimonel: true,
    orden: 8,
    activo: true,
  },
] as const;

const BOAT_STATE_SEED_DEFINITIONS = [
  {
    nombre: 'Disponible',
    permiteUso: true,
    activo: true,
  },
  {
    nombre: 'En mantenimiento',
    permiteUso: false,
    activo: true,
  },
  {
    nombre: 'Fuera de servicio',
    permiteUso: false,
    activo: true,
  },
] as const;

const DEMO_USERS = [
  {
    rut: '11111111-1',
    nombre: 'Alejandro Muñoz',
    telefono: '+56961234567',
    fechaNac: '1988-04-12',
    direccion: 'Av. Costanera 245, Valdivia',
    roles: ['admin', 'presidente'],
  },
  {
    rut: '13888999-2',
    nombre: 'Carolina Peña',
    telefono: '+56969874521',
    fechaNac: '1991-09-03',
    direccion: 'Pasaje Los Laureles 118, Valdivia',
    roles: ['secretario'],
  },
  {
    rut: '15444777-5',
    nombre: 'Sebastián Núñez',
    telefono: '+56974561230',
    fechaNac: '1987-11-19',
    direccion: 'Calle General Lagos 840, Valdivia',
    roles: ['tesorero'],
  },
  {
    rut: '16777000-6',
    nombre: 'Martina Rojas',
    telefono: '+56973456780',
    fechaNac: '1998-02-24',
    direccion: 'Arauco 522, Valdivia',
    roles: ['director', 'deportista'],
  },
  {
    rut: '17666111-4',
    nombre: 'Tomás Ocaña',
    telefono: '+56977889944',
    fechaNac: '1995-07-15',
    direccion: 'Aníbal Pinto 365, Valdivia',
    roles: ['entrenador'],
  },
  {
    rut: '18222999-3',
    nombre: 'Camila Ibáñez',
    telefono: '+56970112233',
    fechaNac: '2001-05-28',
    direccion: 'Bueras 210, Valdivia',
    roles: ['deportista'],
  },
] as const;

const CLUB_ATHLETE_CATEGORY_START_DATE = '2026-03-01';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RolEntity)
    private readonly rolesRepository: Repository<RolEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriesRepository: Repository<CategoriaEntity>,
    @InjectRepository(ClubEntity)
    private readonly clubsRepository: Repository<ClubEntity>,
    @InjectRepository(TipoBoteEntity)
    private readonly boatTypesRepository: Repository<TipoBoteEntity>,
    @InjectRepository(EstadoBoteEntity)
    private readonly boatStatesRepository: Repository<EstadoBoteEntity>,
    @InjectRepository(MenuEntity)
    private readonly menusRepository: Repository<MenuEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemsRepository: Repository<ItemEntity>,
    @InjectRepository(MenuRolEntity)
    private readonly menuRolesRepository: Repository<MenuRolEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
    @InjectRepository(UsuarioRolEntity)
    private readonly userRolesRepository: Repository<UsuarioRolEntity>,
    @InjectRepository(DeportistaEntity)
    private readonly athletesRepository: Repository<DeportistaEntity>,
    @InjectRepository(DeportistaCategoriaEntity)
    private readonly athleteCategoriesRepository: Repository<DeportistaCategoriaEntity>,
    @InjectRepository(ReunionEntity)
    private readonly meetingsRepository: Repository<ReunionEntity>,
    @InjectRepository(ParticipanteReunionEntity)
    private readonly participantsRepository: Repository<ParticipanteReunionEntity>,
    @InjectRepository(ActaEntity)
    private readonly minutesRepository: Repository<ActaEntity>,
    @InjectRepository(PlanAnualEntity)
    private readonly annualPlansRepository: Repository<PlanAnualEntity>,
    @InjectRepository(PlanAreaEntity)
    private readonly planAreasRepository: Repository<PlanAreaEntity>,
    @InjectRepository(PlanItemEntity)
    private readonly planItemsRepository: Repository<PlanItemEntity>,
    @InjectRepository(PlanSeguimientoEntity)
    private readonly planFollowupsRepository: Repository<PlanSeguimientoEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedClub();
    await this.seedCategories();
    await this.seedFleetCatalogs();
    await this.seedMenus();
    const seededUsers = await this.seedUsers();
    await this.seedClubAthletes();
    await this.seedDemoMeetings(seededUsers);
    await this.seedDemoPlanning(seededUsers);
  }

  private async seedRoles() {
    await this.rolesRepository.upsert(
      ROLE_NAMES.map((nombre) => ({ nombre })),
      ['nombre'],
    );
  }

  private async seedClub() {
    const existingClub = await this.clubsRepository.findOneBy({
      nombre: CLUB_SEED_DEFINITION.nombre,
    });

    await this.clubsRepository.save(
      this.clubsRepository.create({
        idClub: existingClub?.idClub,
        ...CLUB_SEED_DEFINITION,
      }),
    );

    this.logger.log('Club base listo.');
  }

  private async seedCategories() {
    const existingCategories = await this.categoriesRepository.find();
    const existingCategoryByName = new Map(
      existingCategories.map(
        (category) => [category.nombre, category] as const,
      ),
    );

    await this.categoriesRepository.save(
      CATEGORY_SEED_DEFINITIONS.map((categoryDefinition) => {
        const existingCategory = existingCategoryByName.get(
          categoryDefinition.nombre,
        );

        return this.categoriesRepository.create({
          idCategoria: existingCategory?.idCategoria,
          ...categoryDefinition,
        });
      }),
    );
    this.logger.log('Categorías deportivas listas.');
  }

  private async seedFleetCatalogs() {
    const existingBoatTypes = await this.boatTypesRepository.find();
    const existingBoatTypeByCode = new Map(
      existingBoatTypes.map((boatType) => [boatType.codigo, boatType] as const),
    );
    const existingBoatStates = await this.boatStatesRepository.find();
    const existingBoatStateByName = new Map(
      existingBoatStates.map(
        (boatState) => [boatState.nombre, boatState] as const,
      ),
    );

    await this.boatTypesRepository.save(
      BOAT_TYPE_SEED_DEFINITIONS.map((boatTypeDefinition) => {
        const existingBoatType = existingBoatTypeByCode.get(
          boatTypeDefinition.codigo,
        );

        return this.boatTypesRepository.create({
          idTipoBote: existingBoatType?.idTipoBote,
          ...boatTypeDefinition,
        });
      }),
    );

    await this.boatStatesRepository.save(
      BOAT_STATE_SEED_DEFINITIONS.map((boatStateDefinition) => {
        const existingBoatState = existingBoatStateByName.get(
          boatStateDefinition.nombre,
        );

        return this.boatStatesRepository.create({
          idEstadoBote: existingBoatState?.idEstadoBote,
          ...boatStateDefinition,
        });
      }),
    );

    this.logger.log('Catalogos de flota listos.');
  }

  private async seedMenus() {
    const inicioMenu = await this.ensureMenu('Inicio', ['Inicio']);
    const usuariosMenu = await this.ensureMenu('Usuarios', ['Usuarios']);
    const deportistasMenu = await this.ensureMenu('Deportistas', [
      'Deportistas',
    ]);
    const flotaMenu = await this.ensureMenu('Flota', ['Flota']);
    const competenciasMenu = await this.ensureMenu('Competencias', [
      'Competencias',
    ]);
    const reunionesMenu = await this.ensureMenu('Reuniones', ['Reuniones']);
    const planificacionMenu = await this.ensureMenu('Planificación', [
      'Planificación',
      'Planificacion',
    ]);

    const roles = await this.rolesRepository.find();
    const roleByName = new Map(roles.map((role) => [role.nombre, role]));

    await this.ensureItem(
      'Listado de usuarios',
      '/usuarios',
      usuariosMenu.idMenu,
    );
    await this.ensureItem(
      'Crear usuario',
      '/usuarios/nuevo',
      usuariosMenu.idMenu,
    );
    await this.ensureItem(
      'Listado de deportistas',
      '/deportistas',
      deportistasMenu.idMenu,
    );
    await this.ensureItem(
      'Registrar deportista',
      '/deportistas/nuevo',
      deportistasMenu.idMenu,
    );
    await this.ensureItem('Gestion de flota', '/flota', flotaMenu.idMenu);
    await this.ensureItem(
      'Gestión de competencias',
      '/competencias',
      competenciasMenu.idMenu,
    );
    await this.ensureItem(
      'Listado de reuniones',
      '/reuniones',
      reunionesMenu.idMenu,
    );
    await this.ensureItem(
      'Crear reunión',
      '/reuniones/nueva',
      reunionesMenu.idMenu,
    );
    await this.ensureItem(
      'Planes anuales',
      '/planificacion',
      planificacionMenu.idMenu,
    );
    await this.ensureItem(
      'Crear plan anual',
      '/planificacion/nuevo',
      planificacionMenu.idMenu,
    );

    const menuRoles: MenuRolEntity[] = [];

    for (const roleName of ROLE_NAMES) {
      const role = roleByName.get(roleName);

      if (role) {
        menuRoles.push({
          idMenu: inicioMenu.idMenu,
          idRol: role.idRol,
        } as MenuRolEntity);
      }
    }

    for (const roleName of MANAGEMENT_ROLE_NAMES) {
      const role = roleByName.get(roleName);

      if (role) {
        menuRoles.push(
          {
            idMenu: usuariosMenu.idMenu,
            idRol: role.idRol,
          } as MenuRolEntity,
          {
            idMenu: reunionesMenu.idMenu,
            idRol: role.idRol,
          } as MenuRolEntity,
          {
            idMenu: planificacionMenu.idMenu,
            idRol: role.idRol,
          } as MenuRolEntity,
        );
      }
    }

    for (const roleName of SPORTS_MENU_ROLE_NAMES) {
      const role = roleByName.get(roleName);

      if (role) {
        menuRoles.push({
          idMenu: deportistasMenu.idMenu,
          idRol: role.idRol,
        } as MenuRolEntity);
      }
    }

    for (const roleName of FLEET_MENU_ROLE_NAMES) {
      const role = roleByName.get(roleName);

      if (role) {
        menuRoles.push({
          idMenu: flotaMenu.idMenu,
          idRol: role.idRol,
        } as MenuRolEntity);
      }
    }

    for (const roleName of COMPETITIONS_MENU_ROLE_NAMES) {
      const role = roleByName.get(roleName);

      if (role) {
        menuRoles.push({
          idMenu: competenciasMenu.idMenu,
          idRol: role.idRol,
        } as MenuRolEntity);
      }
    }

    await this.menuRolesRepository.upsert(menuRoles, ['idMenu', 'idRol']);
    this.logger.log('Catálogo base aplicado.');
  }

  private async seedUsers() {
    const adminRut = this.configService.getOrThrow<string>('app.adminRut');
    const adminPassword = this.configService.getOrThrow<string>(
      'app.adminPassword',
    );
    const defaultUserPassword = this.configService.getOrThrow<string>(
      'app.defaultUserPassword',
    );
    const clubAthletes = buildClubAthleteSeedUsers();

    const demoUsersToUpsert = DEMO_USERS.map((user) => ({
      rut: user.rut,
      nombre: user.rut === adminRut ? 'Alejandro Muñoz' : user.nombre,
      telefono: user.telefono,
      fechaNac: user.fechaNac,
      direccion: user.direccion,
      claveHash: hashPassword(
        user.rut === adminRut ? adminPassword : defaultUserPassword,
      ),
    }));

    const athleteUsersToUpsert = clubAthletes.map((user) => ({
      rut: user.rut,
      nombre: user.nombre,
      telefono: user.telefono,
      fechaNac: user.fechaNac,
      direccion: user.direccion,
    }));

    await this.usersRepository.upsert(demoUsersToUpsert, ['rut']);
    await this.usersRepository.upsert(athleteUsersToUpsert, ['rut']);

    const users = await this.usersRepository.findBy({
      rut: In(DEMO_USERS.map((user) => user.rut)),
    });
    const roles = await this.rolesRepository.find();
    const userByRut = new Map<string, UsuarioEntity>(
      users.map((user) => [user.rut, user]),
    );
    const roleByName = new Map<string, RolEntity>(
      roles.map((role) => [role.nombre, role]),
    );

    await this.userRolesRepository.delete({
      idUsuario: In(users.map((user) => user.idUsuario)),
    });

    const userRoles = DEMO_USERS.flatMap((user) => {
      const currentUser = userByRut.get(user.rut);

      if (!currentUser) {
        return [];
      }

      return [...user.roles]
        .map((roleName) => roleByName.get(roleName))
        .filter((role): role is RolEntity => Boolean(role))
        .map((role) =>
          this.userRolesRepository.create({
            idUsuario: currentUser.idUsuario,
            idRol: role.idRol,
          }),
        );
    });

    await this.userRolesRepository.save(userRoles);
    this.logger.log(
      `Usuarios base listos: ${users.length}. Personas del club: ${clubAthletes.length}.`,
    );

    return userByRut;
  }

  private async seedClubAthletes() {
    const clubAthletes = buildClubAthleteSeedUsers();
    const athleteUsers = await this.usersRepository.findBy({
      rut: In(clubAthletes.map((athlete) => athlete.rut)),
    });
    const userByRut = new Map(
      athleteUsers.map((user) => [user.rut, user] as const),
    );
    const categories = await this.categoriesRepository.find();
    const categoryByName = new Map(
      categories.map((category) => [category.nombre, category] as const),
    );

    const existingAthletes = await this.athletesRepository.findBy({
      idUsuario: In(athleteUsers.map((user) => user.idUsuario)),
    });
    const existingAthleteByUserId = new Map(
      existingAthletes.map((athlete) => [athlete.idUsuario, athlete] as const),
    );

    await this.athletesRepository.save(
      athleteUsers.map((user) => {
        const existingAthlete = existingAthleteByUserId.get(user.idUsuario);

        return this.athletesRepository.create({
          idDeportista: existingAthlete?.idDeportista,
          idUsuario: user.idUsuario,
          activo: true,
        });
      }),
    );

    const athletes = await this.athletesRepository.findBy({
      idUsuario: In(athleteUsers.map((user) => user.idUsuario)),
    });
    const athleteByUserId = new Map(
      athletes.map((athlete) => [athlete.idUsuario, athlete] as const),
    );

    if (athletes.length > 0) {
      await this.athleteCategoriesRepository.delete({
        idDeportista: In(athletes.map((athlete) => athlete.idDeportista)),
      });
    }

    const assignments = clubAthletes.flatMap((athleteSeed) => {
      const user = userByRut.get(athleteSeed.rut);
      const athlete = user ? athleteByUserId.get(user.idUsuario) : null;
      const category = categoryByName.get(athleteSeed.categoryName);

      if (!user || !athlete || !category) {
        return [];
      }

      return this.athleteCategoriesRepository.create({
        idDeportista: athlete.idDeportista,
        idCategoria: category.idCategoria,
        fechaDesde: CLUB_ATHLETE_CATEGORY_START_DATE,
        fechaHasta: null,
        vigente: true,
      });
    });

    await this.athleteCategoriesRepository.save(assignments);

    const masterCount = clubAthletes.filter(
      (athlete) => athlete.categoryName === 'Master',
    ).length;

    this.logger.log(
      `Deportistas demo listos: ${assignments.length}. Master: ${masterCount}.`,
    );
  }

  private async seedDemoMeetings(userByRut: Map<string, UsuarioEntity>) {
    const meetingsCount = await this.meetingsRepository.count();

    if (meetingsCount > 0) {
      return;
    }

    const presidente = userByRut.get('11111111-1');
    const secretaria = userByRut.get('13888999-2');
    const tesorero = userByRut.get('15444777-5');
    const directora = userByRut.get('16777000-6');
    const entrenador = userByRut.get('17666111-4');

    if (!presidente || !secretaria || !tesorero || !directora || !entrenador) {
      return;
    }

    const firstMeeting = await this.meetingsRepository.save(
      this.meetingsRepository.create({
        fecha: '2026-03-18',
        horaInicio: '19:00:00',
        horaFin: '20:45:00',
        lugar: 'Sala de reuniones del Club Phoenix',
        estado: EstadoReunion.REALIZADA,
        modalidad: ModalidadReunion.PRESENCIAL,
      }),
    );

    const secondMeeting = await this.meetingsRepository.save(
      this.meetingsRepository.create({
        fecha: '2026-04-14',
        horaInicio: '19:30:00',
        horaFin: '21:00:00',
        lugar: 'Sala multiuso del gimnasio municipal',
        estado: EstadoReunion.PROGRAMADA,
        modalidad: ModalidadReunion.HIBRIDA,
      }),
    );

    await this.participantsRepository.save(
      [presidente, secretaria, tesorero, directora].map((user) =>
        this.participantsRepository.create({
          idReunion: firstMeeting.idReunion,
          idUsuario: user.idUsuario,
        }),
      ),
    );

    await this.participantsRepository.save(
      [presidente, secretaria, entrenador, directora].map((user) =>
        this.participantsRepository.create({
          idReunion: secondMeeting.idReunion,
          idUsuario: user.idUsuario,
        }),
      ),
    );

    const secretaryRole = await this.rolesRepository.findOneBy({
      nombre: 'secretario',
    });

    if (secretaryRole) {
      await this.minutesRepository.save(
        this.minutesRepository.create({
          idReunion: firstMeeting.idReunion,
          titulo: 'Acta de reunión ordinaria de directorio',
          texto:
            'Se revisó el calendario de regatas, el estado de los botes de entrenamiento y el avance de la campaña de socios colaboradores.',
          fechaActualizacion: new Date('2026-03-18T21:05:00'),
          actualizadoPorId: secretaria.idUsuario,
          idRol: secretaryRole.idRol,
        }),
      );
    }

    this.logger.log('Reuniones demo creadas.');
  }

  private async seedDemoPlanning(userByRut: Map<string, UsuarioEntity>) {
    const plansCount = await this.annualPlansRepository.count();

    if (plansCount > 0) {
      return;
    }

    const presidente = userByRut.get('11111111-1');
    const secretaria = userByRut.get('13888999-2');
    const tesorero = userByRut.get('15444777-5');
    const directora = userByRut.get('16777000-6');

    if (!presidente || !secretaria || !tesorero || !directora) {
      return;
    }

    const plan = await this.annualPlansRepository.save(
      this.annualPlansRepository.create({
        anio: 2026,
        nombre: 'Plan anual de la Rama de Remo',
        estado: EstadoPlanAnual.ACTIVO,
        objetivoGeneral:
          'Fortalecer la gestión deportiva y administrativa de la rama, mejorando asistencia, financiamiento y seguimiento de acuerdos.',
      }),
    );

    const [deportivo, administracion, vinculacion] =
      await this.planAreasRepository.save([
        this.planAreasRepository.create({
          idPlanAnual: plan.idPlanAnual,
          nombre: 'Deportivo',
          descripcion: 'Preparación, competencias y control de asistencia.',
          orden: 1,
        }),
        this.planAreasRepository.create({
          idPlanAnual: plan.idPlanAnual,
          nombre: 'Administración',
          descripcion: 'Actas, presupuesto y seguimiento de acuerdos.',
          orden: 2,
        }),
        this.planAreasRepository.create({
          idPlanAnual: plan.idPlanAnual,
          nombre: 'Vinculación',
          descripcion: 'Relación con apoderados, socios y difusión interna.',
          orden: 3,
        }),
      ]);

    const [item1, item2] = await this.planItemsRepository.save([
      this.planItemsRepository.create({
        idPlanAnual: plan.idPlanAnual,
        idAreaPlan: deportivo.idAreaPlan,
        idResponsable: directora.idUsuario,
        titulo: 'Implementar control semanal de asistencia',
        descripcion:
          'Levantar una planilla única de asistencia para series formativas y adultos.',
        resultadoEsperado:
          'Contar con un reporte semanal validado por la dirección deportiva.',
        prioridad: PrioridadPlanItem.ALTA,
        estado: EstadoPlanItem.EN_CURSO,
        fechaPlanificada: '2026-04-30',
        fechaCumplimientoReal: null,
        resumenFinal: null,
      }),
      this.planItemsRepository.create({
        idPlanAnual: plan.idPlanAnual,
        idAreaPlan: administracion.idAreaPlan,
        idResponsable: secretaria.idUsuario,
        titulo: 'Estandarizar actas de directorio',
        descripcion:
          'Definir una plantilla única con acuerdos, responsables y fechas compromiso.',
        resultadoEsperado:
          'Todas las reuniones del directorio usan el mismo formato de acta.',
        prioridad: PrioridadPlanItem.MEDIA,
        estado: EstadoPlanItem.CUMPLIDO,
        fechaPlanificada: '2026-03-31',
        fechaCumplimientoReal: '2026-03-25',
        resumenFinal:
          'Se aprobó una plantilla estándar y quedó compartida con la directiva.',
      }),
      this.planItemsRepository.create({
        idPlanAnual: plan.idPlanAnual,
        idAreaPlan: vinculacion.idAreaPlan,
        idResponsable: tesorero.idUsuario,
        titulo: 'Actualizar base de socios colaboradores',
        descripcion:
          'Ordenar pagos, contactos y estado de compromiso de socios colaboradores.',
        resultadoEsperado:
          'Disponer de una base consolidada para la campaña de invierno.',
        prioridad: PrioridadPlanItem.ALTA,
        estado: EstadoPlanItem.PENDIENTE,
        fechaPlanificada: '2026-04-10',
        fechaCumplimientoReal: null,
        resumenFinal: null,
      }),
    ]);

    await this.planFollowupsRepository.save([
      this.planFollowupsRepository.create({
        idPlanItem: item1.idPlanItem,
        registradoPorId: directora.idUsuario,
        fechaSeguimiento: new Date('2026-04-02T20:00:00'),
        estado: EstadoPlanItem.EN_CURSO,
        avancePorcentaje: 45,
        comentario:
          'Se consolidó la asistencia de marzo y quedó pendiente integrar la serie master.',
        bloqueos: 'Falta un encargado fijo para el cierre de cada sábado.',
        proximoPaso:
          'Definir responsable por categoría antes del próximo directorio.',
        funcionoBien: 'La planilla compartida redujo duplicidad de registros.',
        porMejorar: 'Asegurar carga de datos el mismo día del entrenamiento.',
      }),
      this.planFollowupsRepository.create({
        idPlanItem: item2.idPlanItem,
        registradoPorId: secretaria.idUsuario,
        fechaSeguimiento: new Date('2026-03-25T19:30:00'),
        estado: EstadoPlanItem.CUMPLIDO,
        avancePorcentaje: 100,
        comentario:
          'Se capacitó a la directiva en el nuevo formato y quedó operativo.',
        bloqueos: null,
        proximoPaso: 'Revisar cumplimiento del formato en la próxima sesión.',
        funcionoBien: 'La estructura simplificó la lectura de acuerdos.',
        porMejorar: null,
      }),
    ]);

    this.logger.log('Planificación demo creada.');
  }

  private async ensureMenu(nombre: string, legacyNames: string[]) {
    const existingMenu = await this.menusRepository.findOne({
      where: legacyNames.map((legacyName) => ({ nombre: legacyName })),
    });

    if (existingMenu) {
      if (existingMenu.nombre !== nombre) {
        await this.menusRepository.save({
          ...existingMenu,
          nombre,
        });
      }

      return existingMenu;
    }

    return this.menusRepository.save(this.menusRepository.create({ nombre }));
  }

  private async ensureItem(nombre: string, ruta: string, idMenu: number) {
    await this.itemsRepository.upsert(
      [
        {
          nombre,
          ruta,
          idMenu,
        },
      ],
      ['ruta'],
    );
  }
}
