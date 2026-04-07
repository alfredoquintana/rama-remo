import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EstadoPlanAnual } from '../../../database/entities';

export class CreatePlanAreaDto {
  @IsString({ message: 'Cada área debe incluir un nombre.' })
  @MaxLength(100, {
    message: 'El nombre del área puede tener hasta 100 caracteres.',
  })
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'La descripción del área debe ser texto.' })
  descripcion?: string;

  @IsOptional()
  @IsInt({ message: 'El orden del área debe ser un número entero.' })
  @Min(1, { message: 'El orden del área debe comenzar en 1.' })
  orden?: number;
}

export class CreatePlanDto {
  @IsInt({ message: 'El año del plan debe ser un número entero.' })
  @Min(2000, { message: 'El año debe estar entre 2000 y 2100.' })
  @Max(2100, { message: 'El año debe estar entre 2000 y 2100.' })
  anio!: number;

  @IsString({ message: 'Debes ingresar un nombre para el plan.' })
  @MaxLength(150, {
    message: 'El nombre del plan puede tener hasta 150 caracteres.',
  })
  nombre!: string;

  @IsOptional()
  @IsEnum(EstadoPlanAnual, { message: 'El estado del plan no es válido.' })
  estado?: EstadoPlanAnual;

  @IsString({ message: 'Debes ingresar el objetivo general del plan.' })
  objetivoGeneral!: string;

  @IsArray({ message: 'Debes enviar la lista de áreas del plan.' })
  @ArrayMinSize(1, { message: 'Debes agregar al menos un área al plan.' })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanAreaDto)
  areas!: CreatePlanAreaDto[];
}
