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
  hibrida: 'Híbrida',
};
