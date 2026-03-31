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
  providers: [MeetingsService],
})
export class MeetingsModule {}
