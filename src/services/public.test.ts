import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getPublicEvent, getAvailableTickets, registerForEvent } from './public'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockEventDetail = {
  id: 'ev-1',
  slug: 'festival-tech',
  title: 'Festival Tech',
  status: 'PUBLISHED',
}

const mockTicket = {
  id: 'tick-1',
  name: 'Ingresso Geral',
  price: 0,
  effectivePrice: 0,
  currency: 'BRL',
  isHalfPrice: false,
  feePassthrough: false,
  isSoldOut: false,
  isOnSale: true,
  quantity: null,
  quantitySold: 0,
  waitlistEnabled: false,
  salesEndDate: null,
  ticketType: 'STANDARD' as const,
  description: null,
}

const mockRegisterResult = {
  id: 'p-1',
  name: 'João',
  email: 'joao@test.com',
  status: 'CONFIRMED',
  eventId: 'ev-1',
  ticketId: 'tick-1',
  qrToken: 'qr-xyz',
  checkedInAt: null,
  certificateReleased: false,
}

beforeEach(() => vi.clearAllMocks())

describe('getPublicEvent', () => {
  it('chama GET /events/public/:slug e retorna o evento público', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockEventDetail })
    const result = await getPublicEvent('festival-tech')
    expect(api.get).toHaveBeenCalledWith('/events/public/festival-tech')
    expect(result).toEqual(mockEventDetail)
  })
})

describe('getAvailableTickets', () => {
  it('chama GET /events/:id/tickets/available e retorna ingressos disponíveis', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockTicket] })
    const result = await getAvailableTickets('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/tickets/available')
    expect(result).toEqual([mockTicket])
  })
})

describe('registerForEvent', () => {
  it('chama POST /events/:id/participants e retorna o resultado do cadastro', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockRegisterResult })
    const input = {
      name: 'João',
      email: 'joao@test.com',
      cpf: '000.000.000-00',
      phone: '11999999999',
    }
    const result = await registerForEvent('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/participants', input)
    expect(result).toEqual(mockRegisterResult)
  })
})
