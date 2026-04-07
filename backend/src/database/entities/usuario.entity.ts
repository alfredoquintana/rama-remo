import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActaEntity } from './acta.entity';
import { DeportistaEntity } from './deportista.entity';
import { ParticipanteReunionEntity } from './participante-reunion.entity';
import { UsuarioRolEntity } from './usuario-rol.entity';

@Entity('usuario')
@Unique(['rut'])
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario!: number;

  @Column({ length: 20 })
  rut!: string;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ length: 30 })
  telefono!: string;

  @Column({ name: 'fecha_nac', type: 'date' })
  fechaNac!: string;

  @Column({ length: 255 })
  direccion!: string;

  @Column({
    name: 'clave_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  claveHash!: string | null;

  @OneToMany(() => UsuarioRolEntity, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles!: UsuarioRolEntity[];

  @OneToMany(
    () => ParticipanteReunionEntity,
    (participacion) => participacion.usuario,
  )
  participacionesReunion!: ParticipanteReunionEntity[];

  @OneToMany(() => ActaEntity, (acta) => acta.actualizadoPor)
  actasActualizadas!: ActaEntity[];

  @OneToOne(() => DeportistaEntity, (deportista) => deportista.usuario)
  deportista?: DeportistaEntity | null;
}
