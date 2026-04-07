import { apiClient } from './api';
import type { Category } from '../types/athletes';

export function getCategories() {
  return apiClient.get<Category[]>('/categories');
}
