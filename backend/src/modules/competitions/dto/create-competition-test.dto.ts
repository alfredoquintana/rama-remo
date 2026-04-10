import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateCompetitionTestDto {
  @IsInt()
  @Min(1)
  numeroPrueba!: number;

  @IsInt()
  @Min(1)
  ordenPrueba!: number;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombrePrueba!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  idCategoria?: number;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  categoriaOrigen?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(60)
  generoOrigen?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(120)
  modalidadOrigen?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(60)
  tipoBoteOrigen?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  idTipoBote?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  distancia?: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @Matches(TIME_PATTERN)
  hora?: string;

  @IsOptional()
  @IsBoolean()
  requiereBote?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadTripulantesEsperada?: number;

  @IsOptional()
  @IsBoolean()
  requiereTimonel?: boolean;

  @IsOptional()
  @IsBoolean()
  esMaster?: boolean;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(2000)
  observacion?: string;
}
