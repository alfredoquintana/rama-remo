import { apiClient } from './api';
import type {
  AthleteDetail,
  AthletesListResponse,
  AthleteUserSearchResult,
  ChangeAthleteCategoryPayload,
  CreateAthletePayload,
} from '../types/athletes';

export function searchAthleteUsers(term: string) {
  const query = new URLSearchParams();

  if (term.trim()) {
    query.set('term', term.trim());
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';

  return apiClient.get<AthleteUserSearchResult[]>(`/athletes/users/search${suffix}`);
}

export function getAthletes(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const query = new URLSearchParams();

  if (options?.page) {
    query.set('page', String(options.page));
  }

  if (options?.pageSize) {
    query.set('pageSize', String(options.pageSize));
  }

  if (options?.search?.trim()) {
    query.set('search', options.search.trim());
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';

  return apiClient.get<AthletesListResponse>(`/athletes${suffix}`);
}

export function getAthlete(id: number) {
  return apiClient.get<AthleteDetail>(`/athletes/${id}`);
}

export function createAthlete(payload: CreateAthletePayload) {
  return apiClient.post<AthleteDetail>('/athletes', payload);
}

export function changeAthleteCategory(
  id: number,
  payload: ChangeAthleteCategoryPayload,
) {
  return apiClient.patch<AthleteDetail>(`/athletes/${id}/category`, payload);
}
