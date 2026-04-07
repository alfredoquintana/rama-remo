import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EstadoPlanItem } from '../../../database/entities';

export class CreatePlanFollowupDto {
  @IsEnum(EstadoPlanItem, {
    message: 'El estado del seguimiento no es valido.',
  })
  estado!: EstadoPlanItem;

  @IsInt({ message: 'El avance debe ser un numero entero.' })
  @Min(0, { message: 'El avance debe estar entre 0 y 100.' })
  @Max(100, { message: 'El avance debe estar entre 0 y 100.' })
  avancePorcentaje!: number;

  @IsString({ message: 'Debes ingresar un comentario de seguimiento.' })
  comentario!: string;

  @IsOptional()
  @IsString({ message: 'Los bloqueos deben enviarse como texto.' })
  bloqueos?: string;

  @IsOptional()
  @IsString({ message: 'El proximo paso debe enviarse como texto.' })
  proximoPaso?: string;

  @IsOptional()
  @IsString({ message: 'El campo de aprendizajes debe enviarse como texto.' })
  funcionoBien?: string;

  @IsOptional()
  @IsString({ message: 'El campo por mejorar debe enviarse como texto.' })
  porMejorar?: string;
}
