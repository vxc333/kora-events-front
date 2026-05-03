export interface Ticket {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  quantity: number | null
  quantitySold: number
  isActive: boolean
  salesStartDate: string | null
  salesEndDate: string | null
  isHalfPrice: boolean
  discountCode: string | null
  discountPercentage: number | null
  eventId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTicketInput {
  name: string
  description?: string
  price: number
  quantity?: number
  isActive?: boolean
  salesStartDate?: string
  salesEndDate?: string
  isHalfPrice?: boolean
}

export type UpdateTicketInput = Partial<CreateTicketInput>
