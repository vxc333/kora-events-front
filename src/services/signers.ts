import { api } from '@/lib/api'
import type { CertificateSigner, CreateSignerInput, UpdateSignerInput } from '@/types/signers'

export async function getSigners(eventId: string): Promise<CertificateSigner[]> {
  const res = await api.get<CertificateSigner[]>(`/events/${eventId}/signers`)
  return res.data
}

export async function createSigner(
  eventId: string,
  data: CreateSignerInput,
): Promise<CertificateSigner> {
  const res = await api.post<CertificateSigner>(`/events/${eventId}/signers`, data)
  return res.data
}

export async function updateSigner(
  eventId: string,
  signerId: string,
  data: UpdateSignerInput,
): Promise<CertificateSigner> {
  const res = await api.patch<CertificateSigner>(`/events/${eventId}/signers/${signerId}`, data)
  return res.data
}

export async function deleteSigner(eventId: string, signerId: string): Promise<void> {
  await api.delete(`/events/${eventId}/signers/${signerId}`)
}

export async function uploadSignerSignature(
  eventId: string,
  signerId: string,
  file: File,
): Promise<CertificateSigner> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<CertificateSigner>(
    `/events/${eventId}/signers/${signerId}/signature`,
    form,
  )
  return res.data
}
