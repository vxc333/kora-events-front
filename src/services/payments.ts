import { api } from '@/lib/api'

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO'
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

export interface Payment {
  id: string
  participantId: string
  eventId: string
  ticketId: string | null
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  pagarmeOrderId: string | null
  pagarmeChargeId: string | null
  pixQrCode: string | null
  pixQrCodeUrl: string | null
  pixExpiresAt: string | null
  boletoUrl: string | null
  boletoBarcode: string | null
  boletoExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export async function checkoutPix(participantId: string): Promise<Payment> {
  const res = await api.post<Payment>('/payments/checkout/pix', { participantId })
  return res.data
}

export async function checkoutBoleto(participantId: string): Promise<Payment> {
  const res = await api.post<Payment>('/payments/checkout/boleto', { participantId })
  return res.data
}

export async function checkoutCard(participantId: string, cardToken: string): Promise<Payment> {
  const res = await api.post<Payment>('/payments/checkout/card', { participantId, cardToken })
  return res.data
}

export async function getPaymentStatus(paymentId: string): Promise<Payment> {
  const res = await api.get<Payment>(`/payments/${paymentId}/status`)
  return res.data
}

export async function refundPayment(paymentId: string): Promise<Payment> {
  const res = await api.post<Payment>(`/payments/${paymentId}/refund`)
  return res.data
}
