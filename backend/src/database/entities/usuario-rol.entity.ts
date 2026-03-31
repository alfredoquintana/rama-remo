import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RolEntity } from './rol.entity';
import { UsuarioEntity } from './usuario.entity';

@Entity('usuario_rol')
export class UsuarioRolEntity {
  @PrimaryColumn({ name: 'id_usuario' })
  idUsuario!: number;

  @PrimaryColumn({ name: 'id_rol' })
  idRol!: number;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.usuarioRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @ManyToOne(() => RolEntity, (rol) => rol.usuarioRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_rol' })
  rol!: RolEntity;
}
