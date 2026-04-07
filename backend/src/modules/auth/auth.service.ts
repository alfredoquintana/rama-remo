import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioEntity } from '../../database/entities';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './password.util';
import { createToken } from './token.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UsuarioEntity)
    private readonly usersRepository: Repository<UsuarioEntity>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { rut: loginDto.rut },
      select: {
        idUsuario: true,
        rut: true,
        nombre: true,
        claveHash: true,
      },
      relations: {
        usuarioRoles: {
          rol: true,
        },
      },
    });

    if (
      !user?.claveHash ||
      !verifyPassword(loginDto.password, user.claveHash)
    ) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if ((user.usuarioRoles?.length ?? 0) === 0) {
      throw new UnauthorizedException('El usuario no tiene acceso habilitado.');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { idUsuario: userId },
      relations: {
        usuarioRoles: {
          rol: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sesión inválida.');
    }

    return this.mapUser(user);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { idUsuario: userId },
      select: {
        idUsuario: true,
        claveHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Sesión inválida.');
    }

    await this.usersRepository.save(
      this.usersRepository.create({
        idUsuario: userId,
        claveHash: hashPassword(changePasswordDto.newPassword),
      }),
    );

    return {
      message: 'Clave actualizada correctamente.',
    };
  }

  private buildAuthResponse(
    user: UsuarioEntity & { claveHash?: string | null },
  ) {
    const normalizedUser = this.mapUser(user);
    const token = createToken(
      {
        sub: normalizedUser.idUsuario,
        rut: normalizedUser.rut,
        roles: normalizedUser.roles.map((role) => role.nombre),
      },
      this.configService.get<string>('app.authSecret', 'rama-remo-dev-secret'),
    );

    return {
      accessToken: token,
      user: normalizedUser,
    };
  }

  private mapUser(user: UsuarioEntity) {
    const roles = [...(user.usuarioRoles ?? [])]
      .map((userRole) => ({
        idRol: userRole.rol.idRol,
        nombre: userRole.rol.nombre,
      }))
      .sort((first, second) => first.nombre.localeCompare(second.nombre));

    return {
      idUsuario: user.idUsuario,
      rut: user.rut,
      nombre: user.nombre,
      roles,
    };
  }
}
