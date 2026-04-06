import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReunionEntity } from './reunion.entity';
import { RolEntity } from './rol.entity';
import { UsuarioEntity } from './usuario.entity';

@Entity('acta')
export class ActaEntity {
  @PrimaryGeneratedColumn({ name: 'id_acta' })
  idActa!: number;

  @Column({ name: 'id_reunion', unique: true })
  idReunion!: number;

  @Column({ type: 'varchar', length: 160, nullable: true })
  titulo!: string | null;

  @Column({ type: 'longtext' })
  texto!: string;

  @Column({ name: 'archivo_nombre', type: 'varchar', length: 255, nullable: true })
  archivoNombre!: string | null;

  @Column({ name: 'archivo_tipo', type: 'varchar', length: 150, nullable: true })
  archivoTipo!: string | null;

  @Column({ name: 'archivo_contenido_base64', type: 'longtext', nullable: true })
  archivoContenidoBase64!: string | null;

  @Column({ name: 'archivo_tamano_bytes', type: 'int', nullable: true })
  archivoTamanoBytes!: number | null;

  @Column({ name: 'fecha_actualizacion', type: 'datetime' })
  fechaActualizacion!: Date;

  @Column({ name: 'actualizado_por' })
  actualizadoPorId!: number;

  @Column({ name: 'id_rol' })
  idRol!: number;

  @OneToOne(() => ReunionEntity, (reunion) => reunion.acta, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reunion' })
  reunion!: ReunionEntity;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.actasActualizadas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'actualizado_por' })
  actualizadoPor!: UsuarioEntity;

  @ManyToOne(() => RolEntity, (rol) => rol.actas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_rol' })
  rol!: RolEntity;
}
