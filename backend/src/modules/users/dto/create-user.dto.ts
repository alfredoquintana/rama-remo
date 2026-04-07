import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(20)
  rut!: string;

  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @MaxLength(30)
  telefono!: string;

  @IsDateString()
  fechaNac!: string;

  @IsString()
  @MaxLength(255)
  direccion!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  roleIds?: number[];
}
