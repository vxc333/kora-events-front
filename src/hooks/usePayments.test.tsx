import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import {
  usePaymentStatus,
  useCheckoutPix,
  useCheckoutBoleto,
  useRefundPayment,
} from './usePayments'
import * as paymentsService from '@/services/payments'
import type { Payment } from '@/services/payments'

vi.mock('@/services/payments')

const mockPayment: Payment = {
  id: 'payment-1',
  participantId: 'participant-1',
  eventId: 'event-1',
  ticketId: null,
  amount: 5000,
  method: 'PIX',
  status: 'PENDING',
  pagarmeOrderId: null,
  pagarmeChargeId: null,
  pixQrCode: 'qrcode-data',
  pixQrCodeUrl: 'https://example.com/qr',
  pixExpiresAt: null,
  boletoUrl: null,
  boletoBarcode: null,
  boletoExpiresAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('usePaymentStatus', () => {
  beforeEach(() => vi.clearAllMocks())

  it('não executa query quando paymentId é null', () => {
    const { result } = renderHook(() => usePaymentStatus(null), { wrapper: makeWrapper() })
    expect(paymentsService.getPaymentStatus).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('retorna dados de pagamento após query resolver', async () => {
    vi.mocked(paymentsService.getPaymentStatus).mockResolvedValue(mockPayment)
    const { result } = renderHook(() => usePaymentStatus('payment-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.status).toBe('PENDING')
    expect(paymentsService.getPaymentStatus).toHaveBeenCalledWith('payment-1')
  })
})

describe('useCheckoutPix', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama paymentsService.checkoutPix com o participantId correto', async () => {
    vi.mocked(paymentsService.checkoutPix).mockResolvedValue(mockPayment)
    const { result } = renderHook(() => useCheckoutPix(), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.mutate('participant-1')
    })
    await waitFor(() => expect(paymentsService.checkoutPix).toHaveBeenCalledWith('participant-1'))
  })
})

describe('useCheckoutBoleto', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama paymentsService.checkoutBoleto com o participantId correto', async () => {
    vi.mocked(paymentsService.checkoutBoleto).mockResolvedValue(mockPayment)
    const { result } = renderHook(() => useCheckoutBoleto(), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.mutate('participant-1')
    })
    await waitFor(() =>
      expect(paymentsService.checkoutBoleto).toHaveBeenCalledWith('participant-1'),
    )
  })
})

describe('useRefundPayment', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama paymentsService.refundPayment com o paymentId correto', async () => {
    vi.mocked(paymentsService.refundPayment).mockResolvedValue(mockPayment)
    const { result } = renderHook(() => useRefundPayment(), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.mutate('payment-1')
    })
    await waitFor(() =>
      expect(paymentsService.refundPayment).toHaveBeenCalledWith('payment-1'),
    )
  })
})
