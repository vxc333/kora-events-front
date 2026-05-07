import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { checkoutPix, checkoutBoleto, checkoutCard, getPaymentStatus, refundPayment } from './payments'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockPayment = {
  id: 'pay-1',
  participantId: 'p-1',
  eventId: 'ev-1',
  ticketId: null,
  amount: 10000,
  method: 'PIX' as const,
  status: 'PENDING' as const,
  pagarmeOrderId: null,
  pagarmeChargeId: null,
  pixQrCode: 'qrcode-data',
  pixQrCodeUrl: 'https://pix.url',
  pixExpiresAt: '2026-06-01T10:30:00.000Z',
  boletoUrl: null,
  boletoBarcode: null,
  boletoExpiresAt: null,
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
}

beforeEach(() => vi.clearAllMocks())

describe('checkoutPix', () => {
  it('chama POST /payments/checkout/pix com participantId e retorna pagamento', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockPayment })
    const result = await checkoutPix('p-1')
    expect(api.post).toHaveBeenCalledWith('/payments/checkout/pix', { participantId: 'p-1' })
    expect(result).toEqual(mockPayment)
  })
})

describe('checkoutBoleto', () => {
  it('chama POST /payments/checkout/boleto com participantId e retorna pagamento', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockPayment, method: 'BOLETO' } })
    const result = await checkoutBoleto('p-1')
    expect(api.post).toHaveBeenCalledWith('/payments/checkout/boleto', { participantId: 'p-1' })
    expect(result.method).toBe('BOLETO')
  })
})

describe('checkoutCard', () => {
  it('chama POST /payments/checkout/card com participantId e cardToken e retorna pagamento', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockPayment, method: 'CREDIT_CARD' } })
    const result = await checkoutCard('p-1', 'card-token-xyz')
    expect(api.post).toHaveBeenCalledWith('/payments/checkout/card', {
      participantId: 'p-1',
      cardToken: 'card-token-xyz',
    })
    expect(result.method).toBe('CREDIT_CARD')
  })
})

describe('getPaymentStatus', () => {
  it('chama GET /payments/:id/status e retorna pagamento', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPayment })
    const result = await getPaymentStatus('pay-1')
    expect(api.get).toHaveBeenCalledWith('/payments/pay-1/status')
    expect(result).toEqual(mockPayment)
  })
})

describe('refundPayment', () => {
  it('chama POST /payments/:id/refund e retorna pagamento reembolsado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockPayment, status: 'REFUNDED' } })
    const result = await refundPayment('pay-1')
    expect(api.post).toHaveBeenCalledWith('/payments/pay-1/refund')
    expect(result.status).toBe('REFUNDED')
  })
})
