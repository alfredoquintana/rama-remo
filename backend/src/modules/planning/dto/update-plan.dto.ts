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
  @IsInt()
  idAreaPlan?: number;

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

export class UpdatePlanDto {
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsEnum(EstadoPlanAnual)
  estado?: EstadoPlanAnual;

  @IsOptional()
  @IsString()
  objetivoGeneral?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePlanAreaDto)
  areas?: UpdatePlanAreaDto[];
}
