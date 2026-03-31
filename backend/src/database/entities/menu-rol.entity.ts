import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MenuEntity } from './menu.entity';
import { RolEntity } from './rol.entity';

@Entity('menu_rol')
export class MenuRolEntity {
  @PrimaryColumn({ name: 'id_menu' })
  idMenu!: number;

  @PrimaryColumn({ name: 'id_rol' })
  idRol!: number;

  @ManyToOne(() => MenuEntity, (menu) => menu.menuRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_menu' })
  menu!: MenuEntity;

  @ManyToOne(() => RolEntity, (rol) => rol.menuRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_rol' })
  rol!: RolEntity;
}
