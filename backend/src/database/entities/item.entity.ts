import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MenuEntity } from './menu.entity';

@Entity('item')
@Unique(['ruta'])
export class ItemEntity {
  @PrimaryGeneratedColumn({ name: 'id_item' })
  idItem!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 200 })
  ruta!: string;

  @Column({ name: 'id_menu' })
  idMenu!: number;

  @ManyToOne(() => MenuEntity, (menu) => menu.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_menu' })
  menu!: MenuEntity;
}
