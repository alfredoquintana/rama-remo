import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuEntity } from '../../database/entities';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menusRepository: Repository<MenuEntity>,
  ) {}

  async findAll() {
    const menus = await this.menusRepository.find({
      relations: {
        items: true,
      },
      order: {
        idMenu: 'ASC',
        items: {
          idItem: 'ASC',
        },
      },
    });

    return menus.map((menu) => ({
      idMenu: menu.idMenu,
      nombre: menu.nombre,
      items: (menu.items ?? []).map((item) => ({
        idItem: item.idItem,
        nombre: item.nombre,
        ruta: item.ruta,
      })),
    }));
  }
}
