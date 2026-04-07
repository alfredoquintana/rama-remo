import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BoteEntity } from './bote.entity';

@Entity('tipo_bote')
@Unique(['codigo'])
export class TipoBoteEntity {
  @PrimaryGeneratedColumn({ name: 'id_tipo_bote' })
  idTipoBote!: number;

  @Column({ length: 10 })
  codigo!: string;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ name: 'requiere_timonel', type: 'boolean', default: false })
  requiereTimonel!: boolean;

  @Column({ type: 'int' })
  orden!: number;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => BoteEntity, (bote) => bote.tipoBote)
  botes!: BoteEntity[];
}
