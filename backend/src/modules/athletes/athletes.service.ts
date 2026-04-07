import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import {
  CategoriaEntity,
  DeportistaCategoriaEntity,
  DeportistaEntity,
  UsuarioEntity,
} from '../../database/entities';
import { ChangeAthleteCategoryDto } from './dto/change-athlete-category.dto';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { ListAthletesQueryDto } from './dto/list-athletes-query.dto';

@Injectable()
export class AthletesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
    @InjectRepository(DeportistaEntity)
    private readonly athletesRepository: Repository<DeportistaEntity>,
    @InjectRepository(DeportistaCategoriaEntity)
    private readonly athleteCategoriesRepository: Repository<DeportistaCategoriaEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriesRepository: Repository<CategoriaEntity>,
  ) {}

  async searchUsers(term?: string) {
    const normalizedTerm = term?.trim() ?? '';
    const query = this.usersRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.deportista', 'deportista')
      .leftJoinAndSelect('usuario.usuarioRoles', 'usuarioRoles')
      .orderBy('usuario.nombre', 'ASC')
      .take(25);

    if (normalizedTerm) {
      query.where(
        new Brackets((builder) => {
          builder
            .where('usuario.nombre LIKE :term', {
              term: `%${normalizedTerm}%`,
            })
            .orWhere('usuario.rut LIKE :term', {
              term: `%${normalizedTerm}%`,
            });
        }),
      );
    }

    const users = await query.getMany();

    return users.map((user) => ({
      idUsuario: user.idUsuario,
      rut: user.rut,
      nombre: user.nombre,
      telefono: user.telefono,
      fechaNac: user.fechaNac,
      direccion: user.direccion,
      accesoHabilitado: (user.usuarioRoles?.length ?? 0) > 0,
      yaEsDeportista: Boolean(user.deportista),
      idDeportista: user.deportista?.idDeportista ?? null,
    }));
  }

  async create(createAthleteDto: CreateAthleteDto) {
    const user = await this.usersRepository.findOneBy({
      idUsuario: createAthleteDto.idUsuario,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const existingAthlete = await this.athletesRepository.findOneBy({
      idUsuario: createAthleteDto.idUsuario,
    });

    if (existingAthlete) {
      throw new ConflictException(
        'El usuario ya se encuentra registrado como deportista.',
      );
    }

    const category = await this.findCategoryOrFail(
      createAthleteDto.idCategoria,
    );

    const athleteId = await this.dataSource.transaction(async (manager) => {
      const athletesRepository = manager.getRepository(DeportistaEntity);
      const athleteCategoriesRepository = manager.getRepository(
        DeportistaCategoriaEntity,
      );

      const athlete = await athletesRepository.save(
        athletesRepository.create({
          idUsuario: createAthleteDto.idUsuario,
          activo: true,
        }),
      );

      await athleteCategoriesRepository.save(
        athleteCategoriesRepository.create({
          idDeportista: athlete.idDeportista,
          idCategoria: category.idCategoria,
          fechaDesde: createAthleteDto.fechaDesde,
          fechaHasta: null,
          vigente: true,
        }),
      );

      return athlete.idDeportista;
    });

    return this.findOne(athleteId);
  }

  async findActive(query: ListAthletesQueryDto) {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 50);
    const search = query.search?.trim().toLowerCase() ?? '';
    const normalizedSearch = search.replace(/\./g, '');
    const tokens = normalizedSearch.split(/\s+/).filter(Boolean);

    const queryBuilder = this.athletesRepository
      .createQueryBuilder('deportista')
      .innerJoinAndSelect('deportista.usuario', 'usuario')
      .leftJoinAndSelect(
        'deportista.categorias',
        'deportistaCategoria',
        'deportistaCategoria.vigente = :vigente',
        { vigente: true },
      )
      .leftJoinAndSelect('deportistaCategoria.categoria', 'categoria')
      .where('deportista.activo = :activo', { activo: true });

    tokens.forEach((token, index) => {
      queryBuilder.andWhere(
        new Brackets((builder) => {
          builder
            .where(`LOWER(usuario.nombre) LIKE :token${index}`, {
              [`token${index}`]: `%${token}%`,
            })
            .orWhere(
              `REPLACE(REPLACE(LOWER(usuario.rut), '.', ''), '-', '') LIKE :rutToken${index}`,
              {
                [`rutToken${index}`]: `%${token.replace(/-/g, '')}%`,
              },
            )
            .orWhere(`LOWER(categoria.nombre) LIKE :categoryToken${index}`, {
              [`categoryToken${index}`]: `%${token}%`,
            });
        }),
      );
    });

    const [athletes, total] = await queryBuilder
      .orderBy('usuario.nombre', 'ASC')
      .addOrderBy('usuario.rut', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: athletes.map((athlete) => this.mapAthleteSummary(athlete)),
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      search: query.search?.trim() ?? '',
    };
  }

  async findOne(id: number) {
    const athlete = await this.athletesRepository.findOne({
      where: { idDeportista: id },
      relations: {
        usuario: true,
        categorias: {
          categoria: true,
        },
      },
    });

    if (!athlete) {
      throw new NotFoundException('Deportista no encontrado.');
    }

    return this.mapAthleteDetail(athlete);
  }

  async changeCategory(
    id: number,
    changeAthleteCategoryDto: ChangeAthleteCategoryDto,
  ) {
    const athlete = await this.athletesRepository.findOne({
      where: { idDeportista: id },
      relations: {
        categorias: {
          categoria: true,
        },
      },
    });

    if (!athlete) {
      throw new NotFoundException('Deportista no encontrado.');
    }

    const category = await this.findCategoryOrFail(
      changeAthleteCategoryDto.idCategoria,
    );
    const currentCategory = (athlete.categorias ?? []).find(
      (item) => item.vigente,
    );

    if (!currentCategory) {
      throw new ConflictException(
        'El deportista no tiene una categoria vigente para realizar el cambio.',
      );
    }

    if (currentCategory.idCategoria === category.idCategoria) {
      throw new ConflictException(
        'La categoria seleccionada ya es la vigente para este deportista.',
      );
    }

    if (changeAthleteCategoryDto.fechaDesde < currentCategory.fechaDesde) {
      throw new ConflictException(
        'La nueva fecha de inicio no puede ser anterior a la categoria vigente.',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      const athleteCategoriesRepository = manager.getRepository(
        DeportistaCategoriaEntity,
      );

      await athleteCategoriesRepository.save(
        athleteCategoriesRepository.create({
          idDeportistaCategoria: currentCategory.idDeportistaCategoria,
          idDeportista: currentCategory.idDeportista,
          idCategoria: currentCategory.idCategoria,
          fechaDesde: currentCategory.fechaDesde,
          fechaHasta: changeAthleteCategoryDto.fechaDesde,
          vigente: false,
        }),
      );

      await athleteCategoriesRepository.save(
        athleteCategoriesRepository.create({
          idDeportista: id,
          idCategoria: category.idCategoria,
          fechaDesde: changeAthleteCategoryDto.fechaDesde,
          fechaHasta: null,
          vigente: true,
        }),
      );
    });

    return this.findOne(id);
  }

  private async findCategoryOrFail(idCategoria: number) {
    const category = await this.categoriesRepository.findOneBy({ idCategoria });

    if (!category) {
      throw new NotFoundException('La categoria indicada no existe.');
    }

    return category;
  }

  private mapAthleteSummary(athlete: DeportistaEntity) {
    const currentCategory = this.findCurrentCategory(athlete);

    return {
      idDeportista: athlete.idDeportista,
      activo: athlete.activo,
      usuario: {
        idUsuario: athlete.usuario.idUsuario,
        rut: athlete.usuario.rut,
        nombre: athlete.usuario.nombre,
        telefono: athlete.usuario.telefono,
        fechaNac: athlete.usuario.fechaNac,
        direccion: athlete.usuario.direccion,
      },
      categoriaVigente: currentCategory
        ? this.mapCategoryAssignment(currentCategory)
        : null,
    };
  }

  private mapAthleteDetail(athlete: DeportistaEntity) {
    const orderedHistory = [...(athlete.categorias ?? [])].sort(
      (first, second) => second.fechaDesde.localeCompare(first.fechaDesde),
    );

    return {
      ...this.mapAthleteSummary(athlete),
      historialCategorias: orderedHistory.map((item) =>
        this.mapCategoryAssignment(item),
      ),
    };
  }

  private findCurrentCategory(athlete: DeportistaEntity) {
    const currentCategories = (athlete.categorias ?? []).filter(
      (item) => item.vigente,
    );

    if (currentCategories.length > 1) {
      throw new ConflictException(
        'El deportista tiene mas de una categoria vigente.',
      );
    }

    return currentCategories[0] ?? null;
  }

  private mapCategoryAssignment(item: DeportistaCategoriaEntity) {
    return {
      idDeportistaCategoria: item.idDeportistaCategoria,
      vigente: item.vigente,
      fechaDesde: item.fechaDesde,
      fechaHasta: item.fechaHasta,
      categoria: {
        idCategoria: item.categoria.idCategoria,
        nombre: item.categoria.nombre,
        edadMin: item.categoria.edadMin,
        edadMax: item.categoria.edadMax,
        orden: item.categoria.orden,
        activa: item.categoria.activa,
      },
    };
  }
}
