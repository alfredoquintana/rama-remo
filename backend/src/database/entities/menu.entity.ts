import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ItemEntity } from './item.entity';
import { MenuRolEntity } from './menu-rol.entity';

@Entity('menu')
@Unique(['nombre'])
export class MenuEntity {
  @PrimaryGeneratedColumn({ name: 'id_menu' })
  idMenu!: number;

  @Column({ length: 100 })
  nombre!: string;

  @OneToMany(() => ItemEntity, (item) => item.menu)
  items!: ItemEntity[];

  @OneToMany(() => MenuRolEntity, (menuRol) => menuRol.menu)
  menuRoles!: MenuRolEntity[];
}
