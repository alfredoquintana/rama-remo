import { IsDateString, IsInt } from 'class-validator';

export class CreateAthleteDto {
  @IsInt()
  idUsuario!: number;

  @IsInt()
  idCategoria!: number;

  @IsDateString()
  fechaDesde!: string;
}
