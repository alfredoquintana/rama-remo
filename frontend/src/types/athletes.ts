export type Category = {
  idCategoria: number;
  nombre: string;
  edadMin: number;
  edadMax: number;
  orden: number;
  activa: boolean;
};

export type AthleteUserSearchResult = {
  idUsuario: number;
  rut: string;
  nombre: string;
  telefono: string;
  fechaNac: string;
  direccion: string;
  accesoHabilitado: boolean;
  yaEsDeportista: boolean;
  idDeportista: number | null;
};

export type AthleteCategoryAssignment = {
  idDeportistaCategoria: number;
  vigente: boolean;
  fechaDesde: string;
  fechaHasta: string | null;
  categoria: Category;
};

export type Athlete = {
  idDeportista: number;
  activo: boolean;
  usuario: {
    idUsuario: number;
    rut: string;
    nombre: string;
    telefono: string;
    fechaNac: string;
    direccion: string;
  };
  categoriaVigente: AthleteCategoryAssignment | null;
};

export type AthletesListResponse = {
  items: Athlete[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search: string;
};

export type AthleteDetail = Athlete & {
  historialCategorias: AthleteCategoryAssignment[];
};

export type CreateAthletePayload = {
  idUsuario: number;
  idCategoria: number;
  fechaDesde: string;
};

export type ChangeAthleteCategoryPayload = {
  idCategoria: number;
  fechaDesde: string;
};
