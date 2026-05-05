import { api } from '@/lib/api'

export interface CheckinResult {
  id: string
  name: string
  email: string
  eventId: string
  checkedInAt: string
}

export interface CheckinStats {
  total: number
  checkedIn: number
  pending: number
}

export async function performCheckin(token: string): Promise<CheckinResult> {
  const res = await api.post<CheckinResult>(`/checkin/${token}`)
  return res.data
}

export async function performCheckinByCpf(cpf: string, eventId: string): Promise<CheckinResult> {
  const res = await api.post<CheckinResult>('/checkin/by-cpf', { cpf, eventId })
  return res.data
}

export async function getCheckinStats(eventId: string): Promise<CheckinStats> {
  const res = await api.get<CheckinStats>(`/events/${eventId}/checkin/stats`)
  return res.data
}
