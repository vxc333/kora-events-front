import { api } from '@/lib/api'
import type { EventPartner, CreatePartnerInput, UpdatePartnerInput } from '@/types/partners'

export async function getPartners(eventId: string): Promise<EventPartner[]> {
  const res = await api.get<EventPartner[]>(`/events/${eventId}/partners`)
  return res.data
}

export async function createPartner(
  eventId: string,
  data: CreatePartnerInput,
): Promise<EventPartner> {
  const res = await api.post<EventPartner>(`/events/${eventId}/partners`, data)
  return res.data
}

export async function updatePartner(
  eventId: string,
  partnerId: string,
  data: UpdatePartnerInput,
): Promise<EventPartner> {
  const res = await api.patch<EventPartner>(`/events/${eventId}/partners/${partnerId}`, data)
  return res.data
}

export async function deletePartner(eventId: string, partnerId: string): Promise<void> {
  await api.delete(`/events/${eventId}/partners/${partnerId}`)
}

export async function uploadPartnerLogo(
  eventId: string,
  partnerId: string,
  file: File,
): Promise<EventPartner> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<EventPartner>(
    `/events/${eventId}/partners/${partnerId}/logo`,
    form,
  )
  return res.data
}
