import { clearAccessToken, getAccessToken, setAccessToken } from '../app/session';
import { apiClient } from './api';
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
} from '../types/auth';

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload);
  setAccessToken(response.accessToken);
  return response;
}

export function logout() {
  clearAccessToken();
}

export function getStoredToken() {
  return getAccessToken();
}

export async function getCurrentUser() {
  return apiClient.get<AuthUser>('/auth/me');
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiClient.patch<{ message: string }>('/auth/password', payload);
}
