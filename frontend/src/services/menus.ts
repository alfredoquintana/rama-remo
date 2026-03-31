import { apiClient } from './api';
import type { Menu } from '../types/navigation';

export function getMenus() {
  return apiClient.get<Menu[]>('/menus');
}
