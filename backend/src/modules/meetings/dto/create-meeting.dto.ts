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

export class CreateMeetingDto {
  @IsDateString()
  fecha!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaFin!: string;

  @IsString()
  @MaxLength(150)
  lugar!: string;

  @IsEnum(EstadoReunion)
  estado!: EstadoReunion;

  @IsEnum(ModalidadReunion)
  modalidad!: ModalidadReunion;

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
