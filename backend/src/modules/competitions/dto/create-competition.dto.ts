import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EstadoCompetencia, TipoCompetencia } from '../../../database/entities';

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateCompetitionDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  nombre!: string;

  @IsEnum(TipoCompetencia)
  tipoCompetencia!: TipoCompetencia;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(160)
  organizador?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(160)
  sede?: string;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsOptional()
  @IsEnum(EstadoCompetencia)
  estado?: EstadoCompetencia;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  observacion?: string;
}
