export type ParticipantStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Participant {
  id: string
  eventId: string
  ticketId: string | null
  couponId: string | null
  name: string
  email: string
  cpf: string | null
  status: ParticipantStatus
  qrToken: string
  checkedInAt: string | null
  certificateReleased: boolean
  registeredAt: string
  updatedAt: string
}

export interface CreateParticipantInput {
  name: string
  email: string
  cpf?: string
  ticketId?: string
}

export type UpdateParticipantInput = Partial<CreateParticipantInput> & {
  status?: ParticipantStatus
  certificateReleased?: boolean
}

export interface ListParticipantsParams {
  status?: ParticipantStatus
  ticketId?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedParticipants {
  data: Participant[]
  total: number
  page: number
  limit: number
}
