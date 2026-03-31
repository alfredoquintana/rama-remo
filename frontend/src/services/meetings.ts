import { apiClient } from './api';
import type { MeetingDetail, MeetingListItem, MeetingPayload } from '../types/meetings';

export function getMeetings() {
  return apiClient.get<MeetingListItem[]>('/meetings');
}

export function getMeeting(id: number) {
  return apiClient.get<MeetingDetail>(`/meetings/${id}`);
}

export function createMeeting(payload: MeetingPayload) {
  return apiClient.post<MeetingDetail>('/meetings', payload);
}

export function updateMeeting(id: number, payload: Partial<MeetingPayload>) {
  return apiClient.patch<MeetingDetail>(`/meetings/${id}`, payload);
}
