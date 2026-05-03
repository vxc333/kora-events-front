import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useTickets, useCreateTicket, useDeleteTicket } from './useTickets'
import * as ticketsService from '@/services/tickets'
import type { Ticket } from '@/types/tickets'

vi.mock('@/services/tickets')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

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

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useTickets', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna lista vazia antes de resolver', () => {
    vi.mocked(ticketsService.getTickets).mockResolvedValue([mockTicket])
    const { result } = renderHook(() => useTickets('event-1'), { wrapper: makeWrapper() })
    expect(result.current.tickets).toEqual([])
  })

  it('retorna ingressos após query resolver', async () => {
    vi.mocked(ticketsService.getTickets).mockResolvedValue([mockTicket])
    const { result } = renderHook(() => useTickets('event-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tickets).toHaveLength(1)
    expect(result.current.tickets[0].name).toBe('Ingresso Padrão')
  })
})

describe('useCreateTicket', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama ticketsService.createTicket', async () => {
    vi.mocked(ticketsService.createTicket).mockResolvedValue(mockTicket)
    const { result } = renderHook(() => useCreateTicket('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.createTicket({ name: 'Ingresso Padrão', price: 0 })
    })
    await waitFor(() => expect(ticketsService.createTicket).toHaveBeenCalledWith('event-1', { name: 'Ingresso Padrão', price: 0 }))
  })
})

describe('useDeleteTicket', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama ticketsService.deleteTicket', async () => {
    vi.mocked(ticketsService.deleteTicket).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteTicket('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.deleteTicket('ticket-1')
    })
    await waitFor(() => expect(ticketsService.deleteTicket).toHaveBeenCalledWith('event-1', 'ticket-1'))
  })
})
