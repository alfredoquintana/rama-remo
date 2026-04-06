import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActaEntity,
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
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RolEntity,
      MenuEntity,
      ItemEntity,
      MenuRolEntity,
      UsuarioEntity,
      UsuarioRolEntity,
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
