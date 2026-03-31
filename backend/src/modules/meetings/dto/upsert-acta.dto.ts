import { IsString, MinLength } from 'class-validator';

export class UpsertActaDto {
  @IsString()
  @MinLength(5)
  texto!: string;
}
