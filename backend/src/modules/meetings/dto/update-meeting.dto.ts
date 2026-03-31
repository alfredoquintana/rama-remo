import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoReunion, ModalidadReunion } from '../../../database/entities';
import { UpsertActaDto } from './upsert-acta.dto';

export class UpdateMeetingDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  lugar?: string;

  @IsOptional()
  @IsEnum(EstadoReunion)
  estado?: EstadoReunion;

  @IsOptional()
  @IsEnum(ModalidadReunion)
  modalidad?: ModalidadReunion;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  participantIds?: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertActaDto)
  acta?: UpsertActaDto;
}
