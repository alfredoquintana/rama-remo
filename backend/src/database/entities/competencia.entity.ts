import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClubEntity } from './club.entity';
import {
  EstadoCompetencia,
  OrigenCompetencia,
  TipoCompetencia,
} from './competencia.enums';
import { CompetenciaPruebaEntity } from './competencia-prueba.entity';

@Entity('competencia')
export class CompetenciaEntity {
  @PrimaryGeneratedColumn({ name: 'id_competencia' })
  idCompetencia!: number;

  @Column({ name: 'id_club' })
  idClub!: number;

  @Column({ length: 180 })
  nombre!: string;

  @Column({
    name: 'tipo_competencia',
    type: 'enum',
    enum: TipoCompetencia,
    default: TipoCompetencia.REGATA,
  })
  tipoCompetencia!: TipoCompetencia;

  @Column({
    type: 'enum',
    enum: OrigenCompetencia,
    default: OrigenCompetencia.MANUAL,
  })
  origen!: OrigenCompetencia;

  @Column({ type: 'varchar', length: 160, nullable: true })
  organizador!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  sede!: string | null;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: string;

  @Column({
    type: 'enum',
    enum: EstadoCompetencia,
    default: EstadoCompetencia.BORRADOR,
  })
  estado!: EstadoCompetencia;

  @Column({ type: 'longtext', nullable: true })
  observacion!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime' })
  fechaActualizacion!: Date;

  @ManyToOne(() => ClubEntity, (club) => club.competencias, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_club' })
  club!: ClubEntity;

  @OneToMany(() => CompetenciaPruebaEntity, (prueba) => prueba.competencia)
  pruebas!: CompetenciaPruebaEntity[];
}
