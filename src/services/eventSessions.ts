import { api } from '@/lib/api'

export interface EventSession {
  id: string
  eventId: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  startTime: string
  endTime: string | null
  sessionCheckins: Array<{ id: string; participantId: string }>
}

export interface CreateSessionInput {
  title: string
  description?: string
  startDate: string
  endDate: string
  startTime: string
  endTime?: string
}

export async function getSessions(eventId: string): Promise<EventSession[]> {
  const res = await api.get<EventSession[]>(`/events/${eventId}/sessions`)
  return res.data
}

export async function createSession(eventId: string, data: CreateSessionInput): Promise<EventSession> {
  const res = await api.post<EventSession>(`/events/${eventId}/sessions`, data)
  return res.data
}

export async function updateSession(
  eventId: string,
  sessionId: string,
  data: Partial<CreateSessionInput>,
): Promise<EventSession> {
  const res = await api.patch<EventSession>(`/events/${eventId}/sessions/${sessionId}`, data)
  return res.data
}

export async function deleteSession(eventId: string, sessionId: string): Promise<void> {
  await api.delete(`/events/${eventId}/sessions/${sessionId}`)
}
