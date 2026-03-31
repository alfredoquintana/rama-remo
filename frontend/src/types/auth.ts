import type { Role } from './users';

export type AuthUser = {
  idUsuario: number;
  rut: string;
  nombre: string;
  roles: Role[];
};

export type LoginPayload = {
  rut: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ChangePasswordPayload = {
  newPassword: string;
};
