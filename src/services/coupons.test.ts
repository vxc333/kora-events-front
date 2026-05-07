import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getCoupons, createCoupon, updateCoupon, deactivateCoupon } from './coupons'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockCoupon = {
  id: 'c-1',
  code: 'DESC10',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  maxUses: 100,
  uses: 0,
  active: true,
  eventId: 'ev-1',
}

beforeEach(() => vi.clearAllMocks())

describe('getCoupons', () => {
  it('chama GET /events/:id/coupons e retorna lista de cupons', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockCoupon] })
    const result = await getCoupons('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/coupons')
    expect(result).toEqual([mockCoupon])
  })
})

describe('createCoupon', () => {
  it('chama POST /events/:id/coupons e retorna o cupom criado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockCoupon })
    const input = { code: 'DESC10', discountType: 'PERCENTAGE' as const, discountValue: 10 }
    const result = await createCoupon('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/coupons', input)
    expect(result).toEqual(mockCoupon)
  })
})

describe('updateCoupon', () => {
  it('chama PATCH /events/:id/coupons/:cid e retorna o cupom atualizado', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: mockCoupon })
    const result = await updateCoupon('ev-1', 'c-1', { discountValue: 20 })
    expect(api.patch).toHaveBeenCalledWith('/events/ev-1/coupons/c-1', { discountValue: 20 })
    expect(result).toEqual(mockCoupon)
  })
})

describe('deactivateCoupon', () => {
  it('chama DELETE /events/:id/coupons/:cid', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await deactivateCoupon('ev-1', 'c-1')
    expect(api.delete).toHaveBeenCalledWith('/events/ev-1/coupons/c-1')
  })
})
