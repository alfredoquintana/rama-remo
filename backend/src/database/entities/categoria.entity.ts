import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DeportistaCategoriaEntity } from './deportista-categoria.entity';

@Entity('categoria')
@Unique(['nombre'])
export class CategoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  idCategoria!: number;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ name: 'edad_min', type: 'int' })
  edadMin!: number;

  @Column({ name: 'edad_max', type: 'int' })
  edadMax!: number;

  @Column({ type: 'int' })
  orden!: number;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @OneToMany(
    () => DeportistaCategoriaEntity,
    (deportistaCategoria) => deportistaCategoria.categoria,
  )
  deportistaCategorias!: DeportistaCategoriaEntity[];
}
