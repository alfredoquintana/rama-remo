import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CategoriaEntity } from '../../database/entities';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriaEntity)
    private readonly categoriesRepository: Repository<CategoriaEntity>,
  ) {}

  async findAll() {
    const categories = await this.categoriesRepository.find({
      order: {
        orden: 'ASC',
        nombre: 'ASC',
      },
    });

    return categories.map((category) => this.mapCategory(category));
  }

  async create(createCategoryDto: CreateCategoryDto) {
    if (createCategoryDto.edadMin > createCategoryDto.edadMax) {
      throw new ConflictException(
        'La edad minima no puede ser mayor que la edad maxima.',
      );
    }

    try {
      const category = await this.categoriesRepository.save(
        this.categoriesRepository.create({
          nombre: createCategoryDto.nombre.trim(),
          edadMin: createCategoryDto.edadMin,
          edadMax: createCategoryDto.edadMax,
          orden: createCategoryDto.orden,
          activa: createCategoryDto.activa ?? true,
        }),
      );

      return this.mapCategory(category);
    } catch (error) {
      const driverError =
        error instanceof QueryFailedError &&
        typeof error.driverError === 'object' &&
        error.driverError !== null
          ? (error.driverError as Record<string, unknown>)
          : null;

      if (
        error instanceof QueryFailedError &&
        driverError &&
        driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Ya existe una categoria con ese nombre.');
      }

      throw error;
    }
  }

  private mapCategory(category: CategoriaEntity) {
    return {
      idCategoria: category.idCategoria,
      nombre: category.nombre,
      edadMin: category.edadMin,
      edadMax: category.edadMax,
      orden: category.orden,
      activa: category.activa,
    };
  }
}
