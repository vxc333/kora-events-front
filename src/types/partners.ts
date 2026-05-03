export interface EventPartner {
  id: string
  eventId: string
  name: string
  logoUrl: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePartnerInput {
  name: string
  displayOrder?: number
}

export type UpdatePartnerInput = Partial<CreatePartnerInput>
