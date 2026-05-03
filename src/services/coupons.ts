import { api } from '@/lib/api'
import type { Coupon, CreateCouponInput, UpdateCouponInput } from '@/types/coupons'

export async function getCoupons(eventId: string): Promise<Coupon[]> {
  const res = await api.get<Coupon[]>(`/events/${eventId}/coupons`)
  return res.data
}

export async function createCoupon(eventId: string, data: CreateCouponInput): Promise<Coupon> {
  const res = await api.post<Coupon>(`/events/${eventId}/coupons`, data)
  return res.data
}

export async function updateCoupon(
  eventId: string,
  couponId: string,
  data: UpdateCouponInput,
): Promise<Coupon> {
  const res = await api.patch<Coupon>(`/events/${eventId}/coupons/${couponId}`, data)
  return res.data
}

export async function deactivateCoupon(eventId: string, couponId: string): Promise<void> {
  await api.delete(`/events/${eventId}/coupons/${couponId}`)
}
