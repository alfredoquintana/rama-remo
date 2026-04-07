export type Role = {
  idRol: number;
  nombre: string;
};

export type User = {
  idUsuario: number;
  rut: string;
  nombre: string;
  telefono: string;
  fechaNac: string;
  direccion: string;
  accesoHabilitado: boolean;
  roles: Role[];
  roleIds: number[];
};

export type UserPayload = {
  rut: string;
  nombre: string;
  telefono: string;
  fechaNac: string;
  direccion: string;
  roleIds: number[];
};

export type UserCreatedResponse = User & {
  provisionalPassword: string | null;
};

export type EnableUserAccessPayload = {
  roleIds: number[];
};
