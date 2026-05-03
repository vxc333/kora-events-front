export type DiscountType = 'PERCENTAGE' | 'FIXED'

export interface Coupon {
  id: string
  eventId: string
  code: string
  discountType: DiscountType
  discountValue: number
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCouponInput {
  code: string
  discountType: DiscountType
  discountValue: number
  maxUses?: number
  isActive?: boolean
  expiresAt?: string
}

export type UpdateCouponInput = Partial<CreateCouponInput>
