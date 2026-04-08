import { apiClient } from './api';
import type {
  EnableUserAccessPayload,
  User,
  UserCreatedResponse,
  UserPayload,
  UsersListResponse,
} from '../types/users';

export function getUsers() {
  return apiClient.get<User[]>('/users');
}

export function getUsersPage(options?: {
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

  return apiClient.get<UsersListResponse>(`/users${suffix}`);
}

export function getUser(id: number) {
  return apiClient.get<User>(`/users/${id}`);
}

export function createUser(payload: UserPayload) {
  return apiClient.post<UserCreatedResponse>('/users', payload);
}

export function updateUser(id: number, payload: Partial<UserPayload>) {
  return apiClient.patch<User>(`/users/${id}`, payload);
}

export function enableUserAccess(id: number, payload: EnableUserAccessPayload) {
  return apiClient.post<UserCreatedResponse>(`/users/${id}/enable-access`, payload);
}

export function deleteUser(id: number) {
  return apiClient.delete<{ message: string }>(`/users/${id}`);
}
