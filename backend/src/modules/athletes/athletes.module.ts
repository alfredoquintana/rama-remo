import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoriaEntity,
  DeportistaCategoriaEntity,
  DeportistaEntity,
  UsuarioEntity,
} from '../../database/entities';
import { AthletesController } from './athletes.controller';
import { AthletesService } from './athletes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioEntity,
      DeportistaEntity,
      DeportistaCategoriaEntity,
      CategoriaEntity,
    ]),
  ],
  controllers: [AthletesController],
  providers: [AthletesService],
  exports: [AthletesService, TypeOrmModule],
})
export class AthletesModule {}
