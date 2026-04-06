import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PlanAnualEntity,
  PlanAreaEntity,
  PlanItemEntity,
  PlanSeguimientoEntity,
  UsuarioEntity,
} from '../../database/entities';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanAnualEntity,
      PlanAreaEntity,
      PlanItemEntity,
      PlanSeguimientoEntity,
      UsuarioEntity,
    ]),
  ],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
