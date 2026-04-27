import { plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT!: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  ATTACHMENTS_DIR?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  APP_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_RUT!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  ADMIN_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  DEFAULT_USER_PASSWORD!: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  LOGIN_RATE_LIMIT_WINDOW_MS?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  LOGIN_RATE_LIMIT_MAX?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  SENSITIVE_RATE_LIMIT_WINDOW_MS?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  SENSITIVE_RATE_LIMIT_MAX?: number;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
