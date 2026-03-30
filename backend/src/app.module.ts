import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { validateEnvironment } from './config/env.validation';
import { typeOrmConfigFactory } from './database/typeorm.config';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      load: [appConfig],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigFactory),
    HealthModule,
  ],
})
export class AppModule {}
