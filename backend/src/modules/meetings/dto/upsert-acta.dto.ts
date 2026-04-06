import { Type } from 'class-transformer';
import {
  IsBase64,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ActaArchivoDto {
  @IsString()
  @MaxLength(255)
  nombre!: string;

  @IsString()
  @MaxLength(150)
  tipo!: string;

  @IsBase64()
  contenidoBase64!: string;

  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  tamanoBytes!: number;
}

export class UpsertActaDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActaArchivoDto)
  archivo?: ActaArchivoDto;
}
