import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EstadoInscripcionCompetencia } from '../../../database/entities';

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CompetitionRegistrationMemberDto {
  @IsInt()
  @Min(1)
  idDeportista!: number;

  @IsInt()
  @Min(1)
  orden!: number;

  @IsOptional()
  @IsBoolean()
  esTimonel?: boolean;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(80)
  rolTexto?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(500)
  observacion?: string;
}

export class UpdateCompetitionRegistrationDto {
  @IsOptional()
  @IsEnum(EstadoInscripcionCompetencia)
  estado?: EstadoInscripcionCompetencia;

  @IsOptional()
  @IsInt()
  @Min(1)
  idBote?: number | null;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => CompetitionRegistrationMemberDto)
  integrantes!: CompetitionRegistrationMemberDto[];
}
