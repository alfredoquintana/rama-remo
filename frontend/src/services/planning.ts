import { apiClient } from './api';
import type {
  AnnualPlanDetail,
  AnnualPlanListItem,
  AnnualPlanPayload,
  PlanningFollowupPayload,
  PlanningItemPayload,
} from '../types/planning';

export function getAnnualPlans() {
  return apiClient.get<AnnualPlanListItem[]>('/planning/annual-plans');
}

export function getAnnualPlan(id: number) {
  return apiClient.get<AnnualPlanDetail>(`/planning/annual-plans/${id}`);
}

export function createAnnualPlan(payload: AnnualPlanPayload) {
  return apiClient.post<AnnualPlanDetail>('/planning/annual-plans', payload);
}

export function updateAnnualPlan(id: number, payload: Partial<AnnualPlanPayload>) {
  return apiClient.patch<AnnualPlanDetail>(`/planning/annual-plans/${id}`, payload);
}

export function deleteAnnualPlan(id: number) {
  return apiClient.delete<{ message: string }>(`/planning/annual-plans/${id}`);
}

export function createPlanningItem(planId: number, payload: PlanningItemPayload) {
  return apiClient.post<AnnualPlanDetail>(
    `/planning/annual-plans/${planId}/items`,
    payload,
  );
}

export function updatePlanningItem(itemId: number, payload: Partial<PlanningItemPayload>) {
  return apiClient.patch<AnnualPlanDetail>(
    `/planning/annual-plans/items/${itemId}`,
    payload,
  );
}

export function createPlanningFollowup(
  itemId: number,
  payload: PlanningFollowupPayload,
) {
  return apiClient.post<AnnualPlanDetail>(
    `/planning/annual-plans/items/${itemId}/follow-ups`,
    payload,
  );
}
