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
  @IsInt({ message: 'Debes seleccionar un area valida.' })
  idAreaPlan!: number;

  @IsOptional()
  @IsInt({ message: 'El responsable seleccionado no es valido.' })
  idResponsable?: number;

  @IsString({ message: 'Debes ingresar un titulo para el item.' })
  @MaxLength(150, {
    message: 'El titulo del item puede tener hasta 150 caracteres.',
  })
  titulo!: string;

  @IsString({ message: 'Debes ingresar una descripcion para el item.' })
  descripcion!: string;

  @IsString({ message: 'Debes ingresar el resultado esperado del item.' })
  resultadoEsperado!: string;

  @IsOptional()
  @IsEnum(PrioridadPlanItem, { message: 'La prioridad del item no es valida.' })
  prioridad?: PrioridadPlanItem;

  @IsOptional()
  @IsEnum(EstadoPlanItem, { message: 'El estado del item no es valido.' })
  estado?: EstadoPlanItem;

  @IsDateString({}, { message: 'Debes ingresar una fecha planificada valida.' })
  fechaPlanificada!: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de cumplimiento real no es valida.' })
  fechaCumplimientoReal?: string;

  @IsOptional()
  @IsString({ message: 'El resumen final debe ser texto.' })
  resumenFinal?: string;
}
