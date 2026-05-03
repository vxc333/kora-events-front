import { api } from '@/lib/api'
import type {
  Participant,
  CreateParticipantInput,
  UpdateParticipantInput,
  ListParticipantsParams,
  PaginatedParticipants,
} from '@/types/participants'

export async function getParticipants(
  eventId: string,
  params?: ListParticipantsParams,
): Promise<PaginatedParticipants> {
  const res = await api.get<PaginatedParticipants>(`/events/${eventId}/participants`, { params })
  return res.data
}

export async function createParticipant(
  eventId: string,
  data: CreateParticipantInput,
): Promise<Participant> {
  const res = await api.post<Participant>(`/events/${eventId}/participants`, data)
  return res.data
}

export async function updateParticipant(
  eventId: string,
  participantId: string,
  data: UpdateParticipantInput,
): Promise<Participant> {
  const res = await api.patch<Participant>(`/events/${eventId}/participants/${participantId}`, data)
  return res.data
}

export async function cancelParticipant(eventId: string, participantId: string): Promise<void> {
  await api.delete(`/events/${eventId}/participants/${participantId}`)
}

export async function importParticipantsCsv(
  eventId: string,
  file: File,
): Promise<{ imported: number }> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<{ imported: number }>(`/events/${eventId}/participants/csv`, form)
  return res.data
}
