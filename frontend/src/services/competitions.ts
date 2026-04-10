import { apiClient } from './api';
import type {
  CompetitionCatalogsResponse,
  CompetitionDetail,
  CompetitionRegistrationPayload,
  CompetitionSummary,
  CompetitionTestPayload,
  CreateCompetitionPayload,
} from '../types/competitions';

export function getCompetitionCatalogs() {
  return apiClient.get<CompetitionCatalogsResponse>('/competitions/catalogs');
}

export function getCompetitions() {
  return apiClient.get<CompetitionSummary[]>('/competitions');
}

export function getCompetition(id: number) {
  return apiClient.get<CompetitionDetail>(`/competitions/${id}`);
}

export function createCompetition(payload: CreateCompetitionPayload) {
  return apiClient.post<CompetitionDetail>('/competitions', payload);
}

export function updateCompetition(
  id: number,
  payload: Partial<CreateCompetitionPayload>,
) {
  return apiClient.patch<CompetitionDetail>(`/competitions/${id}`, payload);
}

export function createCompetitionTest(id: number, payload: CompetitionTestPayload) {
  return apiClient.post<CompetitionDetail>(`/competitions/${id}/tests`, payload);
}

export function updateCompetitionTest(
  idCompetenciaPrueba: number,
  payload: Partial<CompetitionTestPayload>,
) {
  return apiClient.patch<CompetitionDetail>(
    `/competitions/tests/${idCompetenciaPrueba}`,
    payload,
  );
}

export function updateCompetitionRegistration(
  idCompetenciaPrueba: number,
  payload: CompetitionRegistrationPayload,
) {
  return apiClient.patch<CompetitionDetail>(
    `/competitions/tests/${idCompetenciaPrueba}/registration`,
    payload,
  );
}
