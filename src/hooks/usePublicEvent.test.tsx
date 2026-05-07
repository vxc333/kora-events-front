import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { usePublicEvent, useAvailableTickets, useRegisterForEvent } from './usePublicEvent'
import * as publicService from '@/services/public'
import type { EventDetail } from '@/types/events'
import type { AvailableTicket, RegisterResult } from '@/services/public'

vi.mock('@/services/public')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }))

const mockEvent: EventDetail = {
  id: 'event-1',
  slug: 'evento-teste',
  title: 'Evento Teste',
  description: 'Descrição do evento',
  status: 'PUBLISHED',
  bannerUrl: null,
  logoUrl: null,
  startDate: '2026-06-01T00:00:00.000Z',
  endDate: '2026-06-01T00:00:00.000Z',
  startTime: '09:00',
  endTime: '18:00',
  location: 'São Paulo',
  onlineLink: null,
  isOnline: false,
  minimumAttendancePercentage: 75,
  workloadHours: 8,
  isPublic: true,
  requiresApproval: false,
  maxParticipants: null,
  primaryColor: '#000000',
  certificateTemplate: 'DEFAULT',
  certificateBodyText: null,
  pageBlocks: null,
  pageSettings: null,
  organizerId: 'org-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockTicket: AvailableTicket = {
  id: 'ticket-1',
  name: 'Ingresso Geral',
  description: null,
  price: 5000,
  effectivePrice: 5000,
  currency: 'BRL',
  isHalfPrice: false,
  feePassthrough: false,
  isSoldOut: false,
  isOnSale: true,
  quantity: 100,
  quantitySold: 10,
  waitlistEnabled: false,
  salesEndDate: null,
  ticketType: 'STANDARD',
}

const mockRegisterResult: RegisterResult = {
  id: 'participant-1',
  name: 'João Silva',
  email: 'joao@example.com',
  status: 'CONFIRMED',
  eventId: 'event-1',
  ticketId: 'ticket-1',
  qrToken: 'token-abc',
  checkedInAt: null,
  certificateReleased: false,
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('usePublicEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna null antes de resolver', () => {
    vi.mocked(publicService.getPublicEvent).mockResolvedValue(mockEvent)
    const { result } = renderHook(() => usePublicEvent('evento-teste'), { wrapper: makeWrapper() })
    expect(result.current.event).toBeNull()
  })

  it('retorna evento após query resolver', async () => {
    vi.mocked(publicService.getPublicEvent).mockResolvedValue(mockEvent)
    const { result } = renderHook(() => usePublicEvent('evento-teste'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.event?.slug).toBe('evento-teste')
    expect(result.current.event?.title).toBe('Evento Teste')
  })

  it('não executa query quando slug está vazio', () => {
    vi.mocked(publicService.getPublicEvent).mockResolvedValue(mockEvent)
    const { result } = renderHook(() => usePublicEvent(''), { wrapper: makeWrapper() })
    expect(publicService.getPublicEvent).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useAvailableTickets', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna lista vazia antes de resolver', () => {
    vi.mocked(publicService.getAvailableTickets).mockResolvedValue([mockTicket])
    const { result } = renderHook(() => useAvailableTickets('event-1'), {
      wrapper: makeWrapper(),
    })
    expect(result.current.tickets).toEqual([])
  })

  it('retorna ingressos disponíveis após query resolver', async () => {
    vi.mocked(publicService.getAvailableTickets).mockResolvedValue([mockTicket])
    const { result } = renderHook(() => useAvailableTickets('event-1'), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tickets).toHaveLength(1)
    expect(result.current.tickets[0].name).toBe('Ingresso Geral')
  })
})

describe('useRegisterForEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama publicService.registerForEvent com os dados corretos', async () => {
    vi.mocked(publicService.registerForEvent).mockResolvedValue(mockRegisterResult)
    const { result } = renderHook(() => useRegisterForEvent('event-1', 'evento-teste'), {
      wrapper: makeWrapper(),
    })
    const registerData = {
      name: 'João Silva',
      email: 'joao@example.com',
      cpf: '000.000.000-00',
      phone: '11999999999',
    }
    await act(async () => {
      result.current.register(registerData)
    })
    await waitFor(() =>
      expect(publicService.registerForEvent).toHaveBeenCalledWith('event-1', registerData),
    )
  })
})
