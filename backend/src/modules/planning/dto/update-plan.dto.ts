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

export class UpdatePlanAreaDto {
  @IsOptional()
  @IsInt({ message: 'El identificador del area no es valido.' })
  idAreaPlan?: number;

  @IsString({ message: 'Cada area debe incluir un nombre.' })
  @MaxLength(100, {
    message: 'El nombre del area puede tener hasta 100 caracteres.',
  })
  nombre!: string;

  @IsOptional()
  @IsString({ message: 'La descripcion del area debe ser texto.' })
  descripcion?: string;

  @IsOptional()
  @IsInt({ message: 'El orden del area debe ser un numero entero.' })
  @Min(1, { message: 'El orden del area debe comenzar en 1.' })
  orden?: number;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsInt({ message: 'El ano del plan debe ser un numero entero.' })
  @Min(2000, { message: 'El ano debe estar entre 2000 y 2100.' })
  @Max(2100, { message: 'El ano debe estar entre 2000 y 2100.' })
  anio?: number;

  @IsOptional()
  @IsString({ message: 'Debes ingresar un nombre para el plan.' })
  @MaxLength(150, {
    message: 'El nombre del plan puede tener hasta 150 caracteres.',
  })
  nombre?: string;

  @IsOptional()
  @IsEnum(EstadoPlanAnual, { message: 'El estado del plan no es valido.' })
  estado?: EstadoPlanAnual;

  @IsOptional()
  @IsString({ message: 'Debes ingresar el objetivo general del plan.' })
  objetivoGeneral?: string;

  @IsOptional()
  @IsArray({ message: 'Debes enviar la lista de areas del plan.' })
  @ArrayMinSize(1, { message: 'Debes agregar al menos un area al plan.' })
  @ValidateNested({ each: true })
  @Type(() => UpdatePlanAreaDto)
  areas?: UpdatePlanAreaDto[];
}
