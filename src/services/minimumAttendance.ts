import { api } from '@/lib/api'

export interface AttendanceRecord {
  participantId: string
  participantName: string
  participantEmail: string
  totalSessions: number
  attendedSessions: number
  percentage: number // 0-100
  certificateEligible: boolean
}

export interface AttendanceSummary {
  minimumPercentage: number
  eligible: number
  total: number
  records: AttendanceRecord[]
}

export async function getMinimumAttendance(eventId: string): Promise<AttendanceSummary> {
  const res = await api.get<AttendanceSummary>(`/events/${eventId}/minimum-attendance`)
  return res.data
}
