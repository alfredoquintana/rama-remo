import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActaEntity,
  CategoriaEntity,
  ClubEntity,
  DeportistaCategoriaEntity,
  DeportistaEntity,
  EstadoBoteEntity,
  ItemEntity,
  MenuEntity,
  MenuRolEntity,
  ParticipanteReunionEntity,
  PlanAnualEntity,
  PlanAreaEntity,
  PlanItemEntity,
  PlanSeguimientoEntity,
  ReunionEntity,
  RolEntity,
  TipoBoteEntity,
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RolEntity,
      CategoriaEntity,
      ClubEntity,
      TipoBoteEntity,
      EstadoBoteEntity,
      MenuEntity,
      ItemEntity,
      MenuRolEntity,
      UsuarioEntity,
      UsuarioRolEntity,
      DeportistaEntity,
      DeportistaCategoriaEntity,
      ReunionEntity,
      ParticipanteReunionEntity,
      ActaEntity,
      PlanAnualEntity,
      PlanAreaEntity,
      PlanItemEntity,
      PlanSeguimientoEntity,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
