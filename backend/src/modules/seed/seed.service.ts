import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ItemEntity,
  MenuEntity,
  MenuRolEntity,
  RolEntity,
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { hashPassword } from '../auth/password.util';

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

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RolEntity)
    private readonly rolesRepository: Repository<RolEntity>,
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
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedMenus();
    await this.seedAdminUser();
  }

  private async seedRoles() {
    await this.rolesRepository.upsert(
      ROLE_NAMES.map((nombre) => ({ nombre })),
      ['nombre'],
    );
  }

  private async seedMenus() {
    await this.menusRepository.upsert(
      [{ nombre: 'Inicio' }, { nombre: 'Usuarios' }, { nombre: 'Reuniones' }],
      ['nombre'],
    );

    const menus = await this.menusRepository.find({
      order: { idMenu: 'ASC' },
    });
    const roles = await this.rolesRepository.find();
    const menuByName = new Map(menus.map((menu) => [menu.nombre, menu]));
    const roleByName = new Map(roles.map((role) => [role.nombre, role]));

    await this.itemsRepository.upsert(
      [
        {
          nombre: 'Listado de usuarios',
          ruta: '/usuarios',
          idMenu: menuByName.get('Usuarios')!.idMenu,
        },
        {
          nombre: 'Crear usuario',
          ruta: '/usuarios/nuevo',
          idMenu: menuByName.get('Usuarios')!.idMenu,
        },
        {
          nombre: 'Listado de reuniones',
          ruta: '/reuniones',
          idMenu: menuByName.get('Reuniones')!.idMenu,
        },
        {
          nombre: 'Crear reunion',
          ruta: '/reuniones/nueva',
          idMenu: menuByName.get('Reuniones')!.idMenu,
        },
      ],
      ['ruta'],
    );

    const menuRoles: MenuRolEntity[] = [];

    for (const roleName of ROLE_NAMES) {
      const role = roleByName.get(roleName);

      if (role) {
        menuRoles.push({
          idMenu: menuByName.get('Inicio')!.idMenu,
          idRol: role.idRol,
        } as MenuRolEntity);
      }
    }

    for (const roleName of MANAGEMENT_ROLE_NAMES) {
      const role = roleByName.get(roleName);

      if (role) {
        menuRoles.push(
          {
            idMenu: menuByName.get('Usuarios')!.idMenu,
            idRol: role.idRol,
          } as MenuRolEntity,
          {
            idMenu: menuByName.get('Reuniones')!.idMenu,
            idRol: role.idRol,
          } as MenuRolEntity,
        );
      }
    }

    await this.menuRolesRepository.upsert(menuRoles, ['idMenu', 'idRol']);
    this.logger.log('Seed inicial aplicado.');
  }

  private async seedAdminUser() {
    const adminRole = await this.rolesRepository.findOneBy({ nombre: 'admin' });

    if (!adminRole) {
      return;
    }

    const adminRut = this.configService.get<string>(
      'app.adminRut',
      '11111111-1',
    );
    const adminPassword = this.configService.get<string>(
      'app.adminPassword',
      'admin123',
    );

    await this.usersRepository.upsert(
      [
        {
          rut: adminRut,
          nombre: 'Administrador General',
          telefono: '+56900000000',
          fechaNac: '1990-01-01',
          direccion: 'Acceso administrativo',
          claveHash: hashPassword(adminPassword),
        },
      ],
      ['rut'],
    );

    const adminUser = await this.usersRepository.findOneBy({ rut: adminRut });

    if (!adminUser) {
      return;
    }

    await this.userRolesRepository.upsert(
      [
        {
          idUsuario: adminUser.idUsuario,
          idRol: adminRole.idRol,
        },
      ],
      ['idUsuario', 'idRol'],
    );

    this.logger.log(`Usuario admin listo: ${adminRut}`);
  }
}
