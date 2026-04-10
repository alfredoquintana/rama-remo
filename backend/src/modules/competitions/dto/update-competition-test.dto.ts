import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
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

export class UpdateCompetitionTestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroPrueba?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  ordenPrueba?: number;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(200)
  nombrePrueba?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  idCategoria?: number | null;

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
  idTipoBote?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  distancia?: number | null;

  @IsOptional()
  @IsDateString()
  fecha?: string | null;

  @IsOptional()
  @Matches(TIME_PATTERN)
  hora?: string | null;

  @IsOptional()
  @IsBoolean()
  requiereBote?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadTripulantesEsperada?: number | null;

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
  observacion?: string | null;
}
