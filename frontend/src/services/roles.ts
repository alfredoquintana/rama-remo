import { apiClient } from './api';
import type { Role } from '../types/users';

export function getRoles() {
  return apiClient.get<Role[]>('/roles');
}
