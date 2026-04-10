import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EstadoBoteEntity } from './estado-bote.entity';
import { TipoBoteEntity } from './tipo-bote.entity';

@Entity('bote')
@Unique(['nombre'])
export class BoteEntity {
  @PrimaryGeneratedColumn({ name: 'id_bote' })
  idBote!: number;

  @Column({ name: 'id_tipo_bote' })
  idTipoBote!: number;

  @Column({ name: 'id_estado_bote' })
  idEstadoBote!: number;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  marca!: string | null;

  @Column({ name: 'anio', type: 'int', nullable: true })
  anio!: number | null;

  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @ManyToOne(() => TipoBoteEntity, (tipoBote) => tipoBote.botes, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_tipo_bote' })
  tipoBote!: TipoBoteEntity;

  @ManyToOne(() => EstadoBoteEntity, (estadoBote) => estadoBote.botes, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_estado_bote' })
  estadoBote!: EstadoBoteEntity;
}
