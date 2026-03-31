import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
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

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  roleIds!: number[];
}
