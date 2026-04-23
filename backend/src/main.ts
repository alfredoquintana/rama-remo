import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';

const SENSITIVE_HTTP_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();

  expressApp.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      strictTransportSecurity: false,
    }),
  );

  app.use(
    '/auth/login',
    rateLimit({
      windowMs: configService.get<number>('app.loginRateLimitWindowMs', 600_000),
      limit: configService.get<number>('app.loginRateLimitMax', 5),
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      message: {
        message:
          'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.',
      },
    }),
  );

  app.use(
    [
      '/auth/password',
      '/athletes',
      '/categories',
      '/competitions',
      '/fleet',
      '/meetings',
      '/planning/annual-plans',
      '/users',
    ],
    rateLimit({
      windowMs: configService.get<number>(
        'app.sensitiveRateLimitWindowMs',
        60_000,
      ),
      limit: configService.get<number>('app.sensitiveRateLimitMax', 20),
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: (request) => !SENSITIVE_HTTP_METHODS.has(request.method),
      message: {
        message:
          'Se alcanzó el límite temporal para operaciones sensibles. Intenta nuevamente en unos minutos.',
      },
    }),
  );

  app.enableCors({
    origin: configService.get<string>(
      'app.frontendUrl',
      'http://localhost:5173',
    ),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
}

void bootstrap();
