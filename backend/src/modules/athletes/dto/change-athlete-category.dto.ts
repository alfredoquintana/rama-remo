import { IsDateString, IsInt } from 'class-validator';

export class ChangeAthleteCategoryDto {
  @IsInt()
  idCategoria!: number;

  @IsDateString()
  fechaDesde!: string;
}
