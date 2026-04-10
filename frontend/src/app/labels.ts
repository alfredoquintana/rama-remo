import type {
  CompetitionRegistrationStatus,
  CompetitionStatus,
  CompetitionType,
} from '../types/competitions';
import type { MeetingMode, MeetingState } from '../types/meetings';
import type {
  AnnualPlanStatus,
  PlanningItemPriority,
  PlanningItemStatus,
} from '../types/planning';

export const annualPlanStatusLabels: Record<AnnualPlanStatus, string> = {
  borrador: 'Borrador',
  activo: 'Activo',
  cerrado: 'Cerrado',
};

export const planningItemPriorityLabels: Record<PlanningItemPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export const planningItemStatusLabels: Record<PlanningItemStatus, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  cumplido: 'Cumplido',
  parcialmente_cumplido: 'Parcialmente cumplido',
  no_cumplido: 'No cumplido',
  cancelado: 'Cancelado',
};

export const meetingStateLabels: Record<MeetingState, string> = {
  programada: 'Programada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
};

export const meetingModeLabels: Record<MeetingMode, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrida: 'Hibrida',
};

export const competitionTypeLabels: Record<CompetitionType, string> = {
  regata: 'Regata',
  ergometro: 'Ergometro',
};

export const competitionStatusLabels: Record<CompetitionStatus, string> = {
  borrador: 'Borrador',
  en_trabajo: 'En trabajo',
  cerrada: 'Cerrada',
};

export const competitionRegistrationStatusLabels: Record<
  CompetitionRegistrationStatus,
  string
> = {
  presuntiva: 'Presuntiva',
  nominativa: 'Nominativa',
};
