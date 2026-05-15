import { api } from '@/lib/api'

export interface NpsSummary {
  eventId: string
  totalResponses: number
  averageScore: number // 0-10
  npsScore: number // calculated NPS (-100 to +100)
  promoters: number // score 9-10
  passives: number // score 7-8
  detractors: number // score 0-6
  comments: Array<{ score: number; comment: string | null; createdAt: string }>
}

export async function getEventNps(eventId: string): Promise<NpsSummary> {
  const res = await api.get<NpsSummary>(`/events/${eventId}/nps`)
  return res.data
}

export async function exportNpsCsv(eventId: string): Promise<void> {
  const res = await api.get(`/events/${eventId}/nps/export`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nps-${eventId}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function submitNps(
  eventId: string,
  payload: { score: number; comment?: string; respondentToken: string }
): Promise<void> {
  await api.post(`/public/nps/${eventId}`, payload)
}
