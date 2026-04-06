import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EstadoPlanItem, PrioridadPlanItem } from '../../../database/entities';

export class UpdatePlanItemDto {
  @IsOptional()
  @IsInt()
  idAreaPlan?: number;

  @IsOptional()
  @IsInt()
  idResponsable?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  resultadoEsperado?: string;

  @IsOptional()
  @IsEnum(PrioridadPlanItem)
  prioridad?: PrioridadPlanItem;

  @IsOptional()
  @IsEnum(EstadoPlanItem)
  estado?: EstadoPlanItem;

  @IsOptional()
  @IsDateString()
  fechaPlanificada?: string;

  @IsOptional()
  @IsDateString()
  fechaCumplimientoReal?: string;

  @IsOptional()
  @IsString()
  resumenFinal?: string;
}
