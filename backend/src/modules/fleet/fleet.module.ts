import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BoteEntity,
  EstadoBoteEntity,
  TipoBoteEntity,
} from '../../database/entities';
import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoteEntity, TipoBoteEntity, EstadoBoteEntity]),
  ],
  controllers: [FleetController],
  providers: [FleetService],
  exports: [FleetService, TypeOrmModule],
})
export class FleetModule {}
