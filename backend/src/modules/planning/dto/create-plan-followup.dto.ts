import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EstadoPlanItem } from '../../../database/entities';

export class CreatePlanFollowupDto {
  @IsEnum(EstadoPlanItem)
  estado!: EstadoPlanItem;

  @IsInt()
  @Min(0)
  @Max(100)
  avancePorcentaje!: number;

  @IsString()
  comentario!: string;

  @IsOptional()
  @IsString()
  bloqueos?: string;

  @IsOptional()
  @IsString()
  proximoPaso?: string;

  @IsOptional()
  @IsString()
  funcionoBien?: string;

  @IsOptional()
  @IsString()
  porMejorar?: string;
}
