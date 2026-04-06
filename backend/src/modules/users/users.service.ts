import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import {
  RolEntity,
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { hashPassword } from '../auth/password.util';
import { CreateUserDto } from './dto/create-user.dto';
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

  async findAll() {
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
    const roles = await this.loadRoles(createUserDto.roleIds);
    const provisionalPassword = this.configService.get<string>(
      'app.defaultUserPassword',
      'remo1234',
    );

    try {
      const userId = await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(UsuarioEntity);
        const userRoleRepository = manager.getRepository(UsuarioRolEntity);

        const user = await userRepository.save(
          userRepository.create({
            rut: createUserDto.rut,
            nombre: createUserDto.nombre,
            telefono: createUserDto.telefono,
            fechaNac: createUserDto.fechaNac,
            direccion: createUserDto.direccion,
            claveHash: hashPassword(provisionalPassword),
          }),
        );

        await userRoleRepository.save(
          roles.map((role) =>
            userRoleRepository.create({
              idUsuario: user.idUsuario,
              idRol: role.idRol,
            }),
          ),
        );

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
    const existingUser = await this.usersRepository.findOne({
      where: { idUsuario: id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const roles = updateUserDto.roleIds
      ? await this.loadRoles(updateUserDto.roleIds)
      : null;

    try {
      await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(UsuarioEntity);
        const userRoleRepository = manager.getRepository(UsuarioRolEntity);

        await userRepository.save(
          userRepository.create({
            ...existingUser,
            rut: updateUserDto.rut ?? existingUser.rut,
            nombre: updateUserDto.nombre ?? existingUser.nombre,
            telefono: updateUserDto.telefono ?? existingUser.telefono,
            fechaNac: updateUserDto.fechaNac ?? existingUser.fechaNac,
            direccion: updateUserDto.direccion ?? existingUser.direccion,
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
        'No se puede eliminar el usuario porque tiene actas registradas a su nombre.',
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
          'No se puede eliminar el último usuario con rol admin.',
        );
      }
    }

    await this.usersRepository.delete({ idUsuario: id });

    return {
      message: 'Usuario eliminado correctamente.',
    };
  }

  private async loadRoles(roleIds: number[]) {
    const uniqueRoleIds = [...new Set(roleIds)];
    const roles = await this.rolesRepository.findBy({
      idRol: In(uniqueRoleIds),
    });

    if (roles.length !== uniqueRoleIds.length) {
      throw new NotFoundException('Uno o más roles no existen.');
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
      roles,
      roleIds: roles.map((rol) => rol.idRol),
    };
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
