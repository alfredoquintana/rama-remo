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

export class CreateBoatDto {
  @IsInt()
  @Min(1)
  idTipoBote!: number;

  @IsInt()
  @Min(1)
  idEstadoBote!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  marca?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
