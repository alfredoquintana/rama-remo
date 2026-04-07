import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DeportistaCategoriaEntity } from './deportista-categoria.entity';
import { UsuarioEntity } from './usuario.entity';

@Entity('deportista')
@Unique(['idUsuario'])
export class DeportistaEntity {
  @PrimaryGeneratedColumn({ name: 'id_deportista' })
  idDeportista!: number;

  @Column({ name: 'id_usuario' })
  idUsuario!: number;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToOne(() => UsuarioEntity, (usuario) => usuario.deportista, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: UsuarioEntity;

  @OneToMany(
    () => DeportistaCategoriaEntity,
    (deportistaCategoria) => deportistaCategoria.deportista,
  )
  categorias!: DeportistaCategoriaEntity[];
}
