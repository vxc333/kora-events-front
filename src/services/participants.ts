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

export async function exportParticipantsCsv(eventId: string, eventTitle: string): Promise<void> {
  const res = await api.get(`/events/${eventId}/participants/export`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `participantes-${eventTitle.toLowerCase().replace(/\s+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadParticipantCertificate(
  participantId: string,
  participantName: string,
): Promise<void> {
  const res = await api.get(`/certificates/by-participant/${participantId}`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `certificado-${participantName.toLowerCase().replace(/\s+/g, '-')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export async function approveParticipant(eventId: string, participantId: string): Promise<Participant> {
  const res = await api.post<Participant>(`/events/${eventId}/participants/${participantId}/approve`)
  return res.data
}

export async function rejectParticipant(eventId: string, participantId: string): Promise<Participant> {
  const res = await api.post<Participant>(`/events/${eventId}/participants/${participantId}/reject`)
  return res.data
}
