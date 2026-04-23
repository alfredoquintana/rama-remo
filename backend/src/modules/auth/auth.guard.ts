import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { verifyToken } from './token.util';

type AuthenticatedRequest = Request & {
  user?: {
    sub: number;
    rut: string;
    roles: string[];
    exp: number;
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.method === 'OPTIONS') {
      return true;
    }

    if (isPublic) {
      return true;
    }
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No autorizado.');
    }

    const token = authorizationHeader.replace('Bearer ', '');
    const payload = verifyToken(
      token,
      this.configService.getOrThrow<string>('app.authSecret'),
    );

    if (!payload) {
      throw new UnauthorizedException('Sesión inválida o expirada.');
    }

    request.user = payload;
    return true;
  }
}
