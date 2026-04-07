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
  @IsInt({ message: 'Debes seleccionar un área válida.' })
  idAreaPlan!: number;

  @IsOptional()
  @IsInt({ message: 'El responsable seleccionado no es válido.' })
  idResponsable?: number;

  @IsString({ message: 'Debes ingresar un título para el ítem.' })
  @MaxLength(150, {
    message: 'El título del ítem puede tener hasta 150 caracteres.',
  })
  titulo!: string;

  @IsString({ message: 'Debes ingresar una descripción para el ítem.' })
  descripcion!: string;

  @IsString({ message: 'Debes ingresar el resultado esperado del ítem.' })
  resultadoEsperado!: string;

  @IsOptional()
  @IsEnum(PrioridadPlanItem, { message: 'La prioridad del ítem no es válida.' })
  prioridad?: PrioridadPlanItem;

  @IsOptional()
  @IsEnum(EstadoPlanItem, { message: 'El estado del ítem no es válido.' })
  estado?: EstadoPlanItem;

  @IsDateString({}, { message: 'Debes ingresar una fecha planificada válida.' })
  fechaPlanificada!: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de cumplimiento real no es válida.' })
  fechaCumplimientoReal?: string;

  @IsOptional()
  @IsString({ message: 'El resumen final debe ser texto.' })
  resumenFinal?: string;
}
