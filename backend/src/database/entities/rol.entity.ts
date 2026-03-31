import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActaEntity } from './acta.entity';
import { MenuRolEntity } from './menu-rol.entity';
import { UsuarioRolEntity } from './usuario-rol.entity';

@Entity('rol')
@Unique(['nombre'])
export class RolEntity {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  idRol!: number;

  @Column({ length: 80 })
  nombre!: string;

  @OneToMany(() => UsuarioRolEntity, (usuarioRol) => usuarioRol.rol)
  usuarioRoles!: UsuarioRolEntity[];

  @OneToMany(() => ActaEntity, (acta) => acta.rol)
  actas!: ActaEntity[];

  @OneToMany(() => MenuRolEntity, (menuRol) => menuRol.rol)
  menuRoles!: MenuRolEntity[];
}
