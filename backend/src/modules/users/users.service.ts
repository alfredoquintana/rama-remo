import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  In,
  QueryFailedError,
  Repository,
} from 'typeorm';
import {
  RolEntity,
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { isValidPhone, isValidRut, normalizePhone, normalizeRut } from '../../common/contact.util';
import { normalizeFreeText, normalizePersonName } from '../../common/text.util';
import { hashPassword } from '../auth/password.util';
import { CreateUserDto } from './dto/create-user.dto';
import { EnableUserAccessDto } from './dto/enable-user-access.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
    @InjectRepository(UsuarioRolEntity)
    private readonly userRolesRepository: Repository<UsuarioRolEntity>,
    @InjectRepository(RolEntity)
    private readonly rolesRepository: Repository<RolEntity>,
  ) {}

  async findAll(query: ListUsersQueryDto) {
    const search = query.search?.trim().toLowerCase() ?? '';
    const tokens = search.split(/\s+/).filter(Boolean);
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 50);

    if (
      query.page === undefined &&
      query.pageSize === undefined &&
      tokens.length === 0
    ) {
      const users = await this.usersRepository.find({
        relations: {
          usuarioRoles: {
            rol: true,
          },
        },
        order: {
          nombre: 'ASC',
        },
      });

      return users.map((user) => this.mapUser(user));
    }

    if (tokens.length === 0) {
      const [users, total] = await this.usersRepository.findAndCount({
        relations: {
          usuarioRoles: {
            rol: true,
          },
        },
        order: {
          nombre: 'ASC',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return {
        items: users.map((user) => this.mapUser(user)),
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
        search: query.search?.trim() ?? '',
      };
    }

    const idsQueryBuilder = this.usersRepository
      .createQueryBuilder('usuario')
      .select('usuario.idUsuario', 'idUsuario')
      .distinct(true)
      .leftJoin('usuario.usuarioRoles', 'usuarioRol')
      .leftJoin('usuarioRol.rol', 'rol');

    tokens.forEach((token, index) => {
      idsQueryBuilder.andWhere(
        new Brackets((builder) => {
          builder
            .where(`LOWER(usuario.nombre) LIKE :nombre${index}`, {
              [`nombre${index}`]: `%${token}%`,
            })
            .orWhere(`LOWER(usuario.rut) LIKE :rut${index}`, {
              [`rut${index}`]: `%${token}%`,
            })
            .orWhere(`LOWER(usuario.telefono) LIKE :telefono${index}`, {
              [`telefono${index}`]: `%${token}%`,
            })
            .orWhere(`LOWER(COALESCE(rol.nombre, '')) LIKE :rol${index}`, {
              [`rol${index}`]: `%${token}%`,
            });
        }),
      );
    });

    const total = await idsQueryBuilder.getCount();

    const pagedIdRows = await idsQueryBuilder
      .orderBy('usuario.nombre', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany<{ idUsuario: number }>();

    const userIds = pagedIdRows.map((row) => Number(row.idUsuario));
    const users =
      userIds.length > 0
        ? await this.usersRepository.find({
            where: {
              idUsuario: In(userIds),
            },
            relations: {
              usuarioRoles: {
                rol: true,
              },
            },
          })
        : [];

    const usersById = new Map(users.map((user) => [user.idUsuario, user] as const));
    const orderedUsers = userIds
      .map((idUsuario) => usersById.get(idUsuario))
      .filter((user): user is UsuarioEntity => Boolean(user));

    return {
      items: orderedUsers.map((user) => this.mapUser(user)),
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      search: query.search?.trim() ?? '',
    };
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { idUsuario: id },
      relations: {
        usuarioRoles: {
          rol: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return this.mapUser(user);
  }

  async create(createUserDto: CreateUserDto) {
    const normalizedUserData = this.normalizeUserData(createUserDto);
    const roles = createUserDto.roleIds?.length
      ? await this.loadRoles(createUserDto.roleIds)
      : [];
    const provisionalPassword =
      roles.length > 0
        ? this.configService.get<string>('app.defaultUserPassword', 'remo1234')
        : null;

    try {
      const userId = await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(UsuarioEntity);
        const userRoleRepository = manager.getRepository(UsuarioRolEntity);

        const user = await userRepository.save(
          userRepository.create({
            rut: normalizedUserData.rut,
            nombre: normalizedUserData.nombre,
            telefono: normalizedUserData.telefono,
            fechaNac: createUserDto.fechaNac,
            direccion: normalizedUserData.direccion,
            claveHash: provisionalPassword
              ? hashPassword(provisionalPassword)
              : null,
          }),
        );

        if (roles.length > 0) {
          await userRoleRepository.save(
            roles.map((role) =>
              userRoleRepository.create({
                idUsuario: user.idUsuario,
                idRol: role.idRol,
              }),
            ),
          );
        }

        return user.idUsuario;
      });

      const createdUser = await this.findOne(userId);

      return {
        ...createdUser,
        provisionalPassword,
      };
    } catch (error) {
      this.handleDuplicateUser(error);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.findUserWithAccessState(id);

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const hasAccess = this.hasAccessEnabled(existingUser);
    const normalizedUserData = this.normalizeUserData(updateUserDto, true);
    const roles =
      updateUserDto.roleIds !== undefined
        ? await this.resolveRolesForUpdate(updateUserDto.roleIds, hasAccess)
        : null;

    try {
      await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(UsuarioEntity);
        const userRoleRepository = manager.getRepository(UsuarioRolEntity);

        await userRepository.save(
          userRepository.create({
            idUsuario: existingUser.idUsuario,
            rut: normalizedUserData.rut ?? existingUser.rut,
            nombre: normalizedUserData.nombre ?? existingUser.nombre,
            telefono: normalizedUserData.telefono ?? existingUser.telefono,
            fechaNac: updateUserDto.fechaNac ?? existingUser.fechaNac,
            direccion: normalizedUserData.direccion ?? existingUser.direccion,
            claveHash: existingUser.claveHash ?? null,
          }),
        );

        if (roles) {
          await userRoleRepository.delete({ idUsuario: id });

          if (roles.length > 0) {
            await userRoleRepository.save(
              roles.map((role) =>
                userRoleRepository.create({
                  idUsuario: id,
                  idRol: role.idRol,
                }),
              ),
            );
          }
        }
      });

      return this.findOne(id);
    } catch (error) {
      this.handleDuplicateUser(error);
    }
  }

  async enableAccess(id: number, enableUserAccessDto: EnableUserAccessDto) {
    const existingUser = await this.findUserWithAccessState(id);

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (this.hasAccessEnabled(existingUser)) {
      throw new ConflictException('El usuario ya tiene acceso habilitado.');
    }

    const roles = await this.loadRoles(enableUserAccessDto.roleIds);
    const provisionalPassword = this.configService.get<string>(
      'app.defaultUserPassword',
      'remo1234',
    );

    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(UsuarioEntity);
      const userRoleRepository = manager.getRepository(UsuarioRolEntity);

      await userRepository.save(
        userRepository.create({
          idUsuario: id,
          claveHash: hashPassword(provisionalPassword),
        }),
      );

      await userRoleRepository.delete({ idUsuario: id });
      await userRoleRepository.save(
        roles.map((role) =>
          userRoleRepository.create({
            idUsuario: id,
            idRol: role.idRol,
          }),
        ),
      );
    });

    const updatedUser = await this.findOne(id);

    return {
      ...updatedUser,
      provisionalPassword,
    };
  }

  async delete(id: number) {
    const user = await this.usersRepository.findOne({
      where: { idUsuario: id },
      relations: {
        usuarioRoles: {
          rol: true,
        },
        actasActualizadas: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if ((user.actasActualizadas?.length ?? 0) > 0) {
      throw new ConflictException(
        'No se puede eliminar este usuario porque tiene actas registradas a su nombre.',
      );
    }

    const adminRole = user.usuarioRoles?.find(
      (userRole) => userRole.rol.nombre === 'admin',
    );

    if (adminRole) {
      const adminAssignments = await this.userRolesRepository.count({
        where: { idRol: adminRole.idRol },
      });

      if (adminAssignments <= 1) {
        throw new ConflictException(
          'No se puede eliminar este usuario porque es el último con rol admin.',
        );
      }
    }

    await this.usersRepository.delete({ idUsuario: id });

    return {
      message: 'Usuario eliminado correctamente.',
    };
  }

  private normalizeUserData(
    payload: Partial<Pick<CreateUserDto, 'rut' | 'nombre' | 'telefono' | 'direccion'>>,
    allowPartial = false,
  ) {
    const normalizedData = {
      rut: payload.rut !== undefined ? normalizeRut(payload.rut) : undefined,
      nombre:
        payload.nombre !== undefined ? normalizePersonName(payload.nombre) : undefined,
      telefono:
        payload.telefono !== undefined ? normalizePhone(payload.telefono) : undefined,
      direccion:
        payload.direccion !== undefined
          ? normalizeFreeText(payload.direccion)
          : undefined,
    };

    if ((!allowPartial || normalizedData.rut !== undefined) && !normalizedData.rut) {
      throw new BadRequestException('Debes ingresar un RUT.');
    }

    if (
      normalizedData.rut !== undefined &&
      !isValidRut(normalizedData.rut)
    ) {
      throw new BadRequestException(
        'Debes ingresar un RUT válido en formato 12345678-5.',
      );
    }

    if ((!allowPartial || normalizedData.nombre !== undefined) && !normalizedData.nombre) {
      throw new BadRequestException('Debes ingresar el nombre completo.');
    }

    if (
      (!allowPartial || normalizedData.telefono !== undefined) &&
      !normalizedData.telefono
    ) {
      throw new BadRequestException('Debes ingresar un teléfono.');
    }

    if (
      normalizedData.telefono !== undefined &&
      !isValidPhone(normalizedData.telefono)
    ) {
      throw new BadRequestException(
        'Debes ingresar un teléfono válido en formato chileno, por ejemplo +56912345678.',
      );
    }

    if (
      (!allowPartial || normalizedData.direccion !== undefined) &&
      !normalizedData.direccion
    ) {
      throw new BadRequestException('Debes ingresar una dirección.');
    }

    return normalizedData;
  }

  private async loadRoles(roleIds: number[]) {
    const uniqueRoleIds = [...new Set(roleIds)];
    const roles = await this.rolesRepository.findBy({
      idRol: In(uniqueRoleIds),
    });

    if (roles.length !== uniqueRoleIds.length) {
      throw new NotFoundException('Uno o mas roles no existen.');
    }

    return roles;
  }

  private mapUser(user: UsuarioEntity) {
    const roles = [...(user.usuarioRoles ?? [])]
      .map((userRole) => userRole.rol)
      .sort((first, second) => first.nombre.localeCompare(second.nombre))
      .map((rol) => ({
        idRol: rol.idRol,
        nombre: rol.nombre,
      }));

    return {
      idUsuario: user.idUsuario,
      rut: user.rut,
      nombre: user.nombre,
      telefono: user.telefono,
      fechaNac: user.fechaNac,
      direccion: user.direccion,
      accesoHabilitado: roles.length > 0,
      roles,
      roleIds: roles.map((rol) => rol.idRol),
    };
  }

  private async findUserWithAccessState(id: number) {
    return this.usersRepository.findOne({
      where: { idUsuario: id },
      select: {
        idUsuario: true,
        rut: true,
        nombre: true,
        telefono: true,
        fechaNac: true,
        direccion: true,
        claveHash: true,
      },
      relations: {
        usuarioRoles: {
          rol: true,
        },
      },
    });
  }

  private hasAccessEnabled(
    user: UsuarioEntity & { claveHash?: string | null },
  ) {
    return Boolean(user.claveHash) || (user.usuarioRoles?.length ?? 0) > 0;
  }

  private async resolveRolesForUpdate(roleIds: number[], hasAccess: boolean) {
    if (roleIds.length === 0) {
      if (hasAccess) {
        throw new ConflictException(
          'No se puede dejar sin roles a un usuario con acceso habilitado.',
        );
      }

      return [];
    }

    if (!hasAccess) {
      throw new ConflictException(
        'Para asignar roles a un usuario sin acceso debes usar la opción habilitar acceso.',
      );
    }

    return this.loadRoles(roleIds);
  }

  private handleDuplicateUser(error: unknown): never {
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
      throw new ConflictException('Ya existe un usuario con ese RUT.');
    }

    throw error;
  }
}
