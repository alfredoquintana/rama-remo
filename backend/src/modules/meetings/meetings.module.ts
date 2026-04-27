import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActaEntity,
  ParticipanteReunionEntity,
  ReunionEntity,
  RolEntity,
  UsuarioEntity,
  UsuarioRolEntity,
} from '../../database/entities';
import { MeetingsController } from './meetings.controller';
import { MeetingsMinutesService } from './meetings-minutes.service';
import { MeetingsService } from './meetings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReunionEntity,
      ParticipanteReunionEntity,
      ActaEntity,
      UsuarioEntity,
      RolEntity,
      UsuarioRolEntity,
    ]),
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsMinutesService],
})
export class MeetingsModule {}
