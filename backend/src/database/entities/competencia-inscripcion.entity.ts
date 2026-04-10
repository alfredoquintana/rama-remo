import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BoteEntity } from './bote.entity';
import { EstadoInscripcionCompetencia } from './competencia.enums';
import { CompetenciaInscripcionIntegranteEntity } from './competencia-inscripcion-integrante.entity';
import { CompetenciaPruebaEntity } from './competencia-prueba.entity';

@Entity('competencia_inscripcion')
@Unique(['idCompetenciaPrueba'])
export class CompetenciaInscripcionEntity {
  @PrimaryGeneratedColumn({ name: 'id_competencia_inscripcion' })
  idCompetenciaInscripcion!: number;

  @Column({ name: 'id_competencia_prueba' })
  idCompetenciaPrueba!: number;

  @Column({ name: 'id_bote', type: 'int', nullable: true })
  idBote!: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoInscripcionCompetencia.PRESUNTIVA,
  })
  estado!: EstadoInscripcionCompetencia;

  @Column({
    name: 'promedio_edad',
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  promedioEdad!: string | null;

  @Column({ name: 'categoria_master_estimada', type: 'varchar', length: 20, nullable: true })
  categoriaMasterEstimada!: string | null;

  @ManyToOne(() => CompetenciaPruebaEntity, (prueba) => prueba.inscripciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_competencia_prueba' })
  prueba!: CompetenciaPruebaEntity;

  @ManyToOne(() => BoteEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_bote' })
  bote!: BoteEntity | null;

  @OneToMany(
    () => CompetenciaInscripcionIntegranteEntity,
    (integrante) => integrante.inscripcion,
  )
  integrantes!: CompetenciaInscripcionIntegranteEntity[];
}
