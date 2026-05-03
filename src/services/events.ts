import { api } from '@/lib/api'
import type {
  EventsPage,
  GetMyEventsParams,
  EventDetail,
  CreateEventInput,
  UpdateEventInput,
} from '@/types/events'

export async function getMyEvents(params: GetMyEventsParams = {}): Promise<EventsPage> {
  const { page = 1, limit = 10, status } = params
  const res = await api.get<EventsPage>('/events/my', {
    params: { page, limit, status },
  })
  return res.data
}

export async function getEvent(id: string): Promise<EventDetail> {
  const res = await api.get<EventDetail>(`/events/${id}`)
  return res.data
}

export async function createEvent(data: CreateEventInput): Promise<EventDetail> {
  const res = await api.post<EventDetail>('/events', data)
  return res.data
}

export async function updateEvent(id: string, data: UpdateEventInput): Promise<EventDetail> {
  const res = await api.patch<EventDetail>(`/events/${id}`, data)
  return res.data
}

export async function publishEvent(id: string): Promise<EventDetail> {
  const res = await api.post<EventDetail>(`/events/${id}/publish`)
  return res.data
}

export async function cancelEvent(id: string): Promise<EventDetail> {
  const res = await api.delete<EventDetail>(`/events/${id}`)
  return res.data
}

export async function uploadEventImage(
  id: string,
  type: 'banner' | 'logo',
  file: File,
): Promise<EventDetail> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<EventDetail>(`/events/${id}/${type}`, formData)
  return res.data
}

export async function downloadAttendanceReport(eventId: string): Promise<Blob> {
  const res = await api.get(`/events/${eventId}/reports/attendance`, {
    responseType: 'blob',
  })
  return res.data as Blob
}
