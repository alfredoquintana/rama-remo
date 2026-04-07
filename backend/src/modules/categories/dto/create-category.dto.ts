import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsInt()
  @Min(0)
  edadMin!: number;

  @IsInt()
  @Min(0)
  edadMax!: number;

  @IsInt()
  @Min(1)
  orden!: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
