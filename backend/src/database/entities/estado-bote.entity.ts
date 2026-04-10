import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BoteEntity } from './bote.entity';

@Entity('estado_bote')
@Unique(['nombre'])
export class EstadoBoteEntity {
  @PrimaryGeneratedColumn({ name: 'id_estado_bote' })
  idEstadoBote!: number;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ name: 'permite_uso', type: 'boolean', default: true })
  permiteUso!: boolean;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => BoteEntity, (bote) => bote.estadoBote)
  botes!: BoteEntity[];
}
