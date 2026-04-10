export type BoatType = {
  idTipoBote: number;
  codigo: string;
  nombre: string;
  requiereTimonel: boolean;
  orden: number;
  activo: boolean;
};

export type BoatState = {
  idEstadoBote: number;
  nombre: string;
  permiteUso: boolean;
  activo: boolean;
};

export type Boat = {
  idBote: number;
  nombre: string;
  marca: string | null;
  anio: number | null;
  activo: boolean;
  tipoBote: BoatType;
  estadoBote: BoatState;
};

export type BoatDetail = Boat & {
  observacion: string | null;
};

export type FleetCatalogsResponse = {
  tiposBote: BoatType[];
  estadosBote: BoatState[];
};

export type FleetListResponse = {
  items: Boat[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search: string;
  idTipoBote: number | null;
  idEstadoBote: number | null;
  activo: boolean | null;
};

export type BoatPayload = {
  idTipoBote: number;
  idEstadoBote: number;
  nombre: string;
  marca?: string;
  anio?: number;
  observacion?: string;
  activo?: boolean;
};
