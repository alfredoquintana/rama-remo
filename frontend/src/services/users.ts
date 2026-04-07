import { apiClient } from './api';
import type {
  EnableUserAccessPayload,
  User,
  UserCreatedResponse,
  UserPayload,
} from '../types/users';

export function getUsers() {
  return apiClient.get<User[]>('/users');
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
