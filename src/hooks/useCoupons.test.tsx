import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeactivateCoupon } from './useCoupons'
import * as couponsService from '@/services/coupons'
import type { Coupon } from '@/types/coupons'

vi.mock('@/services/coupons')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockCoupon: Coupon = {
  id: 'coupon-1',
  eventId: 'event-1',
  code: 'DESC10',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  maxUses: 100,
  usedCount: 5,
  isActive: true,
  expiresAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useCoupons', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna lista vazia antes de resolver', () => {
    vi.mocked(couponsService.getCoupons).mockResolvedValue([mockCoupon])
    const { result } = renderHook(() => useCoupons('event-1'), { wrapper: makeWrapper() })
    expect(result.current.coupons).toEqual([])
  })

  it('retorna cupons após query resolver', async () => {
    vi.mocked(couponsService.getCoupons).mockResolvedValue([mockCoupon])
    const { result } = renderHook(() => useCoupons('event-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.coupons).toHaveLength(1)
    expect(result.current.coupons[0].code).toBe('DESC10')
  })

  it('não executa query quando eventId está vazio', () => {
    vi.mocked(couponsService.getCoupons).mockResolvedValue([])
    const { result } = renderHook(() => useCoupons(''), { wrapper: makeWrapper() })
    expect(couponsService.getCoupons).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useCreateCoupon', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama couponsService.createCoupon com os argumentos corretos', async () => {
    vi.mocked(couponsService.createCoupon).mockResolvedValue(mockCoupon)
    const { result } = renderHook(() => useCreateCoupon('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.createCoupon({ code: 'DESC10', discountType: 'PERCENTAGE', discountValue: 10 })
    })
    await waitFor(() =>
      expect(couponsService.createCoupon).toHaveBeenCalledWith('event-1', {
        code: 'DESC10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
      }),
    )
  })
})

describe('useUpdateCoupon', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama couponsService.updateCoupon com os argumentos corretos', async () => {
    vi.mocked(couponsService.updateCoupon).mockResolvedValue(mockCoupon)
    const { result } = renderHook(() => useUpdateCoupon('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.updateCoupon({ couponId: 'coupon-1', data: { isActive: false } })
    })
    await waitFor(() =>
      expect(couponsService.updateCoupon).toHaveBeenCalledWith('event-1', 'coupon-1', {
        isActive: false,
      }),
    )
  })
})

describe('useDeactivateCoupon', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama couponsService.deactivateCoupon com o id correto', async () => {
    vi.mocked(couponsService.deactivateCoupon).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeactivateCoupon('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.deactivateCoupon('coupon-1')
    })
    await waitFor(() =>
      expect(couponsService.deactivateCoupon).toHaveBeenCalledWith('event-1', 'coupon-1'),
    )
  })
})
