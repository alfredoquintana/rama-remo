import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolEntity } from '../../database/entities';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolEntity)
    private readonly rolesRepository: Repository<RolEntity>,
  ) {}

  async findAll() {
    const roles = await this.rolesRepository.find({
      order: { nombre: 'ASC' },
    });

    return roles.map((rol) => ({
      idRol: rol.idRol,
      nombre: rol.nombre,
    }));
  }
}
