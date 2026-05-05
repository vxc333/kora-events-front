export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'FINISHED' | 'CANCELLED'

export type CertificateTemplate = 'DEFAULT' | 'LANDSCAPE' | 'MINIMALIST'

export type { PageBlock, PageSettings } from './page-builder'

export interface EventSummary {
  id: string
  title: string
  status: EventStatus
  startDate: string
  endDate: string
  location: string | null
  isOnline: boolean
}

export interface EventDetail {
  id: string
  slug: string
  title: string
  description: string
  status: EventStatus
  bannerUrl: string | null
  logoUrl: string | null
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string | null
  onlineLink: string | null
  isOnline: boolean
  minimumAttendancePercentage: number
  workloadHours: number | null
  isPublic: boolean
  requiresApproval: boolean
  maxParticipants: number | null
  primaryColor: string
  certificateTemplate: CertificateTemplate
  certificateBodyText: string | null
  pageBlocks: import('./page-builder').PageBlock[] | null
  pageSettings: import('./page-builder').PageSettings | null
  organizerId: string
  createdAt: string
  updatedAt: string
}

export interface EventsPage {
  data: EventSummary[]
  total: number
  page: number
  limit: number
}

export interface GetMyEventsParams {
  page?: number
  limit?: number
  status?: EventStatus
}

export interface CreateEventInput {
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location?: string
  onlineLink?: string
  isOnline?: boolean
  workloadHours?: number
  isPublic?: boolean
  requiresApproval?: boolean
  maxParticipants?: number
  minimumAttendancePercentage?: number
}

export type UpdateEventInput = Partial<CreateEventInput & { certificateBodyText: string }>
