import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt } from 'class-validator';

export class EnableUserAccessDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  roleIds!: number[];
}
