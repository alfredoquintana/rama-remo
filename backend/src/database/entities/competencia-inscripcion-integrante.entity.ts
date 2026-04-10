import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DeportistaEntity } from './deportista.entity';
import { CompetenciaInscripcionEntity } from './competencia-inscripcion.entity';

@Entity('competencia_inscripcion_integrante')
@Unique(['idCompetenciaInscripcion', 'idDeportista'])
@Unique(['idCompetenciaInscripcion', 'orden'])
export class CompetenciaInscripcionIntegranteEntity {
  @PrimaryGeneratedColumn({ name: 'id_competencia_inscripcion_integrante' })
  idCompetenciaInscripcionIntegrante!: number;

  @Column({ name: 'id_competencia_inscripcion' })
  idCompetenciaInscripcion!: number;

  @Column({ name: 'id_deportista' })
  idDeportista!: number;

  @Column({ type: 'int' })
  orden!: number;

  @Column({ name: 'es_timonel', type: 'boolean', default: false })
  esTimonel!: boolean;

  @Column({ name: 'rol_texto', type: 'varchar', length: 80, nullable: true })
  rolTexto!: string | null;

  @Column({ name: 'snapshot_nombre', length: 150 })
  snapshotNombre!: string;

  @Column({ name: 'snapshot_rut', length: 20 })
  snapshotRut!: string;

  @Column({ name: 'snapshot_fecha_nacimiento', type: 'date' })
  snapshotFechaNacimiento!: string;

  @Column({ name: 'edad_competencia', type: 'int' })
  edadCompetencia!: number;

  @Column({
    name: 'categoria_master_individual',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  categoriaMasterIndividual!: string | null;

  @Column({ type: 'longtext', nullable: true })
  observacion!: string | null;

  @ManyToOne(
    () => CompetenciaInscripcionEntity,
    (inscripcion) => inscripcion.integrantes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'id_competencia_inscripcion' })
  inscripcion!: CompetenciaInscripcionEntity;

  @ManyToOne(() => DeportistaEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_deportista' })
  deportista!: DeportistaEntity;
}
