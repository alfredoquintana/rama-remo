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
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;
}

export class CreatePlanDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio!: number;

  @IsString()
  @MaxLength(150)
  nombre!: string;

  @IsOptional()
  @IsEnum(EstadoPlanAnual)
  estado?: EstadoPlanAnual;

  @IsOptional()
  @IsString()
  objetivoGeneral?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePlanAreaDto)
  areas!: CreatePlanAreaDto[];
}
