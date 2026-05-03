import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getTickets, createTicket, updateTicket, deleteTicket } from './tickets'
import type { Ticket } from '@/types/tickets'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockTicket: Ticket = {
  id: 'ticket-1',
  name: 'Ingresso Padrão',
  description: null,
  price: 0,
  currency: 'BRL',
  quantity: 100,
  quantitySold: 0,
  isActive: true,
  salesStartDate: null,
  salesEndDate: null,
  isHalfPrice: false,
  discountCode: null,
  discountPercentage: null,
  eventId: 'event-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => vi.clearAllMocks())

describe('getTickets', () => {
  it('chama GET /events/:eventId/tickets e retorna lista', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockTicket] })
    const result = await getTickets('event-1')
    expect(api.get).toHaveBeenCalledWith('/events/event-1/tickets')
    expect(result).toEqual([mockTicket])
  })
})

describe('createTicket', () => {
  it('chama POST /events/:eventId/tickets com body e retorna ingresso', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockTicket })
    const input = { name: 'Ingresso Padrão', price: 0, quantity: 100 }
    const result = await createTicket('event-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/event-1/tickets', input)
    expect(result).toEqual(mockTicket)
  })
})

describe('updateTicket', () => {
  it('chama PATCH /events/:eventId/tickets/:id com body', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { ...mockTicket, name: 'Atualizado' } })
    const result = await updateTicket('event-1', 'ticket-1', { name: 'Atualizado' })
    expect(api.patch).toHaveBeenCalledWith('/events/event-1/tickets/ticket-1', { name: 'Atualizado' })
    expect(result.name).toBe('Atualizado')
  })
})

describe('deleteTicket', () => {
  it('chama DELETE /events/:eventId/tickets/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: undefined })
    await deleteTicket('event-1', 'ticket-1')
    expect(api.delete).toHaveBeenCalledWith('/events/event-1/tickets/ticket-1')
  })
})
