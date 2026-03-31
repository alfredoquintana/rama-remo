import { IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(20)
  rut!: string;

  @IsString()
  @MaxLength(100)
  password!: string;
}
