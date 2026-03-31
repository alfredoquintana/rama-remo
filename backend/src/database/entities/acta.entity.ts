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

  @Column({ type: 'longtext' })
  texto!: string;

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
