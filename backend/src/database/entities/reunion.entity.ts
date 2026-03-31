import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActaEntity } from './acta.entity';
import { ParticipanteReunionEntity } from './participante-reunion.entity';

export enum EstadoReunion {
  PROGRAMADA = 'programada',
  REALIZADA = 'realizada',
  CANCELADA = 'cancelada',
}

export enum ModalidadReunion {
  PRESENCIAL = 'presencial',
  ONLINE = 'online',
  HIBRIDA = 'hibrida',
}

@Entity('reunion')
export class ReunionEntity {
  @PrimaryGeneratedColumn({ name: 'id_reunion' })
  idReunion!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio!: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin!: string;

  @Column({ length: 150 })
  lugar!: string;

  @Column({
    type: 'enum',
    enum: EstadoReunion,
    default: EstadoReunion.PROGRAMADA,
  })
  estado!: EstadoReunion;

  @Column({
    type: 'enum',
    enum: ModalidadReunion,
    default: ModalidadReunion.PRESENCIAL,
  })
  modalidad!: ModalidadReunion;

  @OneToMany(
    () => ParticipanteReunionEntity,
    (participante) => participante.reunion,
  )
  participantes!: ParticipanteReunionEntity[];

  @OneToOne(() => ActaEntity, (acta) => acta.reunion)
  acta!: ActaEntity | null;
}
