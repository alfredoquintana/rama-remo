import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BoteEntity,
  CategoriaEntity,
  ClubEntity,
  CompetenciaEntity,
  CompetenciaInscripcionEntity,
  CompetenciaInscripcionIntegranteEntity,
  CompetenciaPruebaEntity,
  DeportistaEntity,
  TipoBoteEntity,
} from '../../database/entities';
import { CompetitionCatalogsService } from './competition-catalogs.service';
import { CompetitionsController } from './competitions.controller';
import { CompetitionsService } from './competitions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClubEntity,
      CategoriaEntity,
      CompetenciaEntity,
      CompetenciaPruebaEntity,
      CompetenciaInscripcionEntity,
      CompetenciaInscripcionIntegranteEntity,
      DeportistaEntity,
      BoteEntity,
      TipoBoteEntity,
    ]),
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService, CompetitionCatalogsService],
})
export class CompetitionsModule {}
