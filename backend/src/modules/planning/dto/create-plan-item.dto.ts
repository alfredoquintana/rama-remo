import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EstadoPlanItem, PrioridadPlanItem } from '../../../database/entities';

export class CreatePlanItemDto {
  @IsInt()
  idAreaPlan!: number;

  @IsOptional()
  @IsInt()
  idResponsable?: number;

  @IsString()
  @MaxLength(150)
  titulo!: string;

  @IsString()
  descripcion!: string;

  @IsString()
  resultadoEsperado!: string;

  @IsOptional()
  @IsEnum(PrioridadPlanItem)
  prioridad?: PrioridadPlanItem;

  @IsOptional()
  @IsEnum(EstadoPlanItem)
  estado?: EstadoPlanItem;

  @IsDateString()
  fechaPlanificada!: string;

  @IsOptional()
  @IsDateString()
  fechaCumplimientoReal?: string;

  @IsOptional()
  @IsString()
  resumenFinal?: string;
}
