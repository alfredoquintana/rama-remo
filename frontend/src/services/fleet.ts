import { apiClient } from './api';
import type {
  BoatDetail,
  BoatPayload,
  FleetCatalogsResponse,
  FleetListResponse,
} from '../types/fleet';

export function getFleetCatalogs() {
  return apiClient.get<FleetCatalogsResponse>('/fleet/catalogs');
}

export function getFleet(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  idTipoBote?: number;
  idEstadoBote?: number;
  activo?: boolean;
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

  if (options?.idTipoBote) {
    query.set('idTipoBote', String(options.idTipoBote));
  }

  if (options?.idEstadoBote) {
    query.set('idEstadoBote', String(options.idEstadoBote));
  }

  if (options?.activo !== undefined) {
    query.set('activo', String(options.activo));
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';

  return apiClient.get<FleetListResponse>(`/fleet${suffix}`);
}

export function getBoat(id: number) {
  return apiClient.get<BoatDetail>(`/fleet/${id}`);
}

export function createBoat(payload: BoatPayload) {
  return apiClient.post<BoatDetail>('/fleet', payload);
}

export function updateBoat(id: number, payload: Partial<BoatPayload>) {
  return apiClient.patch<BoatDetail>(`/fleet/${id}`, payload);
}

export function deleteBoat(id: number) {
  return apiClient.delete<{ message: string }>(`/fleet/${id}`);
}
