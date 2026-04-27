import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoBoteEntity } from './tipo-bote.entity';
import { OrigenDatoPrueba } from './competencia.enums';
import { CategoriaEntity } from './categoria.entity';
import { CompetenciaEntity } from './competencia.entity';
import { CompetenciaInscripcionEntity } from './competencia-inscripcion.entity';

@Entity('competencia_prueba')
export class CompetenciaPruebaEntity {
  @PrimaryGeneratedColumn({ name: 'id_competencia_prueba' })
  idCompetenciaPrueba!: number;

  @Column({ name: 'id_competencia' })
  idCompetencia!: number;

  @Column({ name: 'id_tipo_bote', type: 'int', nullable: true })
  idTipoBote!: number | null;

  @Column({ name: 'id_categoria', type: 'int', nullable: true })
  idCategoria!: number | null;

  @Column({ name: 'numero_prueba', type: 'int' })
  numeroPrueba!: number;

  @Column({ name: 'orden_prueba', type: 'int' })
  ordenPrueba!: number;

  @Column({ name: 'nombre_prueba', length: 200 })
  nombrePrueba!: string;

  @Column({
    name: 'categoria_origen',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  categoriaOrigen!: string | null;

  @Column({
    name: 'genero_origen',
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  generoOrigen!: string | null;

  @Column({
    name: 'modalidad_origen',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  modalidadOrigen!: string | null;

  @Column({
    name: 'tipo_bote_origen',
    type: 'varchar',
    length: 60,
    nullable: true,
  })
  tipoBoteOrigen!: string | null;

  @Column({ type: 'int', nullable: true })
  distancia!: number | null;

  @Column({ type: 'date', nullable: true })
  fecha!: string | null;

  @Column({ type: 'time', nullable: true })
  hora!: string | null;

  @Column({ name: 'requiere_bote', type: 'boolean', default: true })
  requiereBote!: boolean;

  @Column({
    name: 'cantidad_tripulantes_esperada',
    type: 'int',
    nullable: true,
  })
  cantidadTripulantesEsperada!: number | null;

  @Column({ name: 'requiere_timonel', type: 'boolean', default: false })
  requiereTimonel!: boolean;

  @Column({ name: 'es_master', type: 'boolean', default: false })
  esMaster!: boolean;

  @Column({ type: 'longtext', nullable: true })
  observacion!: string | null;

  @Column({
    name: 'origen_dato',
    type: 'enum',
    enum: OrigenDatoPrueba,
    default: OrigenDatoPrueba.MANUAL,
  })
  origenDato!: OrigenDatoPrueba;

  @ManyToOne(() => CompetenciaEntity, (competencia) => competencia.pruebas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_competencia' })
  competencia!: CompetenciaEntity;

  @ManyToOne(() => TipoBoteEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_tipo_bote' })
  tipoBote!: TipoBoteEntity | null;

  @ManyToOne(() => CategoriaEntity, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_categoria' })
  categoria!: CategoriaEntity | null;

  @OneToMany(
    () => CompetenciaInscripcionEntity,
    (inscripcion) => inscripcion.prueba,
  )
  inscripciones!: CompetenciaInscripcionEntity[];
}
