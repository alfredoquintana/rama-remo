export type AnnualPlanStatus = 'borrador' | 'activo' | 'cerrado';
export type PlanningItemPriority = 'baja' | 'media' | 'alta';
export type PlanningItemStatus =
  | 'pendiente'
  | 'en_curso'
  | 'cumplido'
  | 'parcialmente_cumplido'
  | 'no_cumplido'
  | 'cancelado';

export type AnnualPlanSummary = {
  totalItems: number;
  pendientes: number;
  enCurso: number;
  cumplidos: number;
  parcialmenteCumplidos: number;
  noCumplidos: number;
  cancelados: number;
  atrasados: number;
  porcentajeCumplimiento: number;
};

export type AnnualPlanArea = {
  idAreaPlan: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  itemCount: number;
};

export type PlanningFollowup = {
  idPlanSeguimiento: number;
  fechaSeguimiento: string;
  estado: PlanningItemStatus;
  avancePorcentaje: number;
  comentario: string;
  bloqueos: string | null;
  proximoPaso: string | null;
  funcionoBien: string | null;
  porMejorar: string | null;
  registradoPor: {
    idUsuario: number;
    nombre: string;
  } | null;
};

export type PlanningItem = {
  idPlanItem: number;
  titulo: string;
  descripcion: string;
  resultadoEsperado: string;
  prioridad: PlanningItemPriority;
  estado: PlanningItemStatus;
  fechaPlanificada: string;
  fechaCumplimientoReal: string | null;
  resumenFinal: string | null;
  area: {
    idAreaPlan: number;
    nombre: string;
  };
  responsable: {
    idUsuario: number;
    nombre: string;
  } | null;
  lastProgress: number;
  followups: PlanningFollowup[];
};

export type AnnualPlanListItem = {
  idPlanAnual: number;
  anio: number;
  nombre: string;
  estado: AnnualPlanStatus;
  objetivoGeneral: string | null;
  summary: AnnualPlanSummary;
};

export type AnnualPlanDetail = {
  idPlanAnual: number;
  anio: number;
  nombre: string;
  estado: AnnualPlanStatus;
  objetivoGeneral: string | null;
  areas: AnnualPlanArea[];
  items: PlanningItem[];
  summary: AnnualPlanSummary;
  transparencyNotes: {
    cumplidoVsTotal: string;
    pendientesCriticos: string;
  };
};

export type AnnualPlanPayload = {
  anio: number;
  nombre: string;
  estado?: AnnualPlanStatus;
  objetivoGeneral?: string;
  areas: Array<{
    idAreaPlan?: number;
    nombre: string;
    descripcion?: string;
    orden?: number;
  }>;
};

export type PlanningItemPayload = {
  idAreaPlan: number;
  idResponsable?: number | null;
  titulo: string;
  descripcion: string;
  resultadoEsperado: string;
  prioridad?: PlanningItemPriority;
  estado?: PlanningItemStatus;
  fechaPlanificada: string;
  fechaCumplimientoReal?: string;
  resumenFinal?: string;
};

export type PlanningFollowupPayload = {
  estado: PlanningItemStatus;
  avancePorcentaje: number;
  comentario: string;
  bloqueos?: string;
  proximoPaso?: string;
  funcionoBien?: string;
  porMejorar?: string;
};
