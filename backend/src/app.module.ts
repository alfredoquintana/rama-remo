import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { validateEnvironment } from './config/env.validation';
import { typeOrmConfigFactory } from './database/typeorm.config';
import { AthletesModule } from './modules/athletes/athletes.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { HealthModule } from './modules/health/health.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { MenusModule } from './modules/menus/menus.module';
import { PlanningModule } from './modules/planning/planning.module';
import { RolesModule } from './modules/roles/roles.module';
import { SeedModule } from './modules/seed/seed.module';
import { UsersModule } from './modules/users/users.module';
import { AuthGuard } from './modules/auth/auth.guard';

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
    CategoriesModule,
    AthletesModule,
    AuthModule,
    HealthModule,
    RolesModule,
    UsersModule,
    MeetingsModule,
    PlanningModule,
    MenusModule,
    SeedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
