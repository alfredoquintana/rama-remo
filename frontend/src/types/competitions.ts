export type CompetitionType = 'regata' | 'ergometro';
export type CompetitionOrigin = 'manual' | 'importada';
export type CompetitionStatus = 'borrador' | 'en_trabajo' | 'cerrada';
export type CompetitionRegistrationStatus = 'presuntiva' | 'nominativa';

export type CompetitionBoatType = {
  idTipoBote: number;
  codigo: string;
  nombre: string;
  requiereTimonel?: boolean;
};

export type CompetitionBoat = {
  idBote: number;
  nombre: string;
  tipoBote: CompetitionBoatType | null;
};

export type CompetitionAthlete = {
  idDeportista: number;
  nombre: string;
  rut: string;
  fechaNacimiento: string;
  categoriaVigente: {
    idCategoria: number;
    nombre: string;
  } | null;
};

export type CompetitionCategory = {
  idCategoria: number;
  nombre: string;
  edadMin: number;
  edadMax: number;
  orden: number;
  activa: boolean;
};

export type CompetitionCatalogsResponse = {
  club: {
    idClub: number;
    nombre: string;
  };
  tiposCompetencia: CompetitionType[];
  estadosCompetencia: CompetitionStatus[];
  estadosInscripcion: CompetitionRegistrationStatus[];
  categorias: CompetitionCategory[];
  modalidadesPrueba: string[];
  distanciasPrueba: number[];
  tiposBote: CompetitionBoatType[];
  botes: CompetitionBoat[];
  deportistas: CompetitionAthlete[];
};

export type CompetitionSummary = {
  idCompetencia: number;
  nombre: string;
  tipoCompetencia: CompetitionType;
  origen: CompetitionOrigin;
  organizador: string | null;
  sede: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: CompetitionStatus;
  observacion: string | null;
  resumen: {
    pruebas: number;
    inscripciones: number;
  };
};

export type CompetitionRegistrationMember = {
  idCompetenciaInscripcionIntegrante: number;
  idDeportista: number;
  orden: number;
  esTimonel: boolean;
  rolTexto: string | null;
  snapshotNombre: string;
  snapshotRut: string;
  snapshotFechaNacimiento: string;
  edadCompetencia: number;
  categoriaMasterIndividual: string | null;
  observacion: string | null;
};

export type CompetitionRegistration = {
  idCompetenciaInscripcion: number;
  estado: CompetitionRegistrationStatus;
  promedioEdad: number | null;
  categoriaMasterEstimada: string | null;
  bote: CompetitionBoat | null;
  integrantes: CompetitionRegistrationMember[];
};

export type CompetitionTest = {
  idCompetenciaPrueba: number;
  numeroPrueba: number;
  ordenPrueba: number;
  nombrePrueba: string;
  categoria: CompetitionCategory | null;
  categoriaOrigen: string | null;
  generoOrigen: string | null;
  modalidadOrigen: string | null;
  tipoBoteOrigen: string | null;
  tipoBoteNormalizado: CompetitionBoatType | null;
  distancia: number | null;
  fecha: string | null;
  hora: string | null;
  requiereBote: boolean;
  cantidadTripulantesEsperada: number | null;
  requiereTimonel: boolean;
  esMaster: boolean;
  observacion: string | null;
  origenDato: 'manual' | 'importada' | 'editada';
  inscripcion: CompetitionRegistration | null;
};

export type CompetitionDetail = {
  idCompetencia: number;
  club: {
    idClub: number;
    nombre: string;
  } | null;
  nombre: string;
  tipoCompetencia: CompetitionType;
  origen: CompetitionOrigin;
  organizador: string | null;
  sede: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: CompetitionStatus;
  observacion: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  resumen: CompetitionSummary['resumen'];
  pruebas: CompetitionTest[];
};

export type CreateCompetitionPayload = {
  nombre: string;
  tipoCompetencia: CompetitionType;
  organizador?: string;
  sede?: string;
  fechaInicio: string;
  fechaFin: string;
  estado?: CompetitionStatus;
  observacion?: string;
};

export type CompetitionTestPayload = {
  numeroPrueba: number;
  ordenPrueba: number;
  nombrePrueba: string;
  idCategoria?: number;
  categoriaOrigen?: string;
  generoOrigen?: string;
  modalidadOrigen?: string;
  tipoBoteOrigen?: string;
  idTipoBote?: number;
  distancia?: number;
  fecha?: string;
  hora?: string;
  requiereBote?: boolean;
  cantidadTripulantesEsperada?: number;
  requiereTimonel?: boolean;
  esMaster?: boolean;
  observacion?: string;
};

export type CompetitionRegistrationMemberPayload = {
  idDeportista: number;
  orden: number;
  esTimonel?: boolean;
  rolTexto?: string;
  observacion?: string;
};

export type CompetitionRegistrationPayload = {
  estado?: CompetitionRegistrationStatus;
  idBote?: number;
  integrantes: CompetitionRegistrationMemberPayload[];
};
