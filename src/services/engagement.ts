import { api } from '@/lib/api'

export interface EngagementMetrics {
  eventId: string
  eventTitle: string
  certificateDownloads: number
  emailOpenRate: number    // 0-100
  returnParticipants: number
  checkinRate: number      // 0-100
  npsAverage: number | null
}

export interface EngagementSummary {
  totalCertificateDownloads: number
  averageEmailOpenRate: number
  averageCheckinRate: number
  averageNps: number | null
  events: EngagementMetrics[]
}

export async function getEngagementSummary(): Promise<EngagementSummary> {
  const res = await api.get<EngagementSummary>('/analytics/engagement')
  return res.data
}
