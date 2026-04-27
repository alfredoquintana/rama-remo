import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CompetenciaEntity } from './competencia.entity';

@Entity('club')
@Unique(['nombre'])
export class ClubEntity {
  @PrimaryGeneratedColumn({ name: 'id_club' })
  idClub!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'text', nullable: true })
  observacion!: string | null;

  @OneToMany(() => CompetenciaEntity, (competencia) => competencia.club)
  competencias!: CompetenciaEntity[];
}
