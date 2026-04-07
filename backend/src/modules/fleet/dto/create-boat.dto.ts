import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateBoatDto {
  @IsInt()
  @Min(1)
  idTipoBote!: number;

  @IsInt()
  @Min(1)
  idEstadoBote!: number;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  marca?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  observacion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
