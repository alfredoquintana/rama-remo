import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoriaEntity } from './categoria.entity';
import { DeportistaEntity } from './deportista.entity';

@Entity('deportista_categoria')
export class DeportistaCategoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id_deportista_categoria' })
  idDeportistaCategoria!: number;

  @Column({ name: 'id_deportista' })
  idDeportista!: number;

  @Column({ name: 'id_categoria' })
  idCategoria!: number;

  @Column({ name: 'fecha_desde', type: 'date' })
  fechaDesde!: string;

  @Column({ name: 'fecha_hasta', type: 'date', nullable: true })
  fechaHasta!: string | null;

  @Column({ type: 'boolean', default: true })
  vigente!: boolean;

  @ManyToOne(() => DeportistaEntity, (deportista) => deportista.categorias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_deportista' })
  deportista!: DeportistaEntity;

  @ManyToOne(
    () => CategoriaEntity,
    (categoria) => categoria.deportistaCategorias,
    {
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({ name: 'id_categoria' })
  categoria!: CategoriaEntity;
}
