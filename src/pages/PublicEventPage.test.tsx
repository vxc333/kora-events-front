import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { PublicEventPage } from './PublicEventPage'
import * as usePublicEventModule from '@/hooks/usePublicEvent'

vi.mock('@/hooks/usePublicEvent')
vi.mock('@/components/BlockRenderers', () => ({
  PageBlockRenderer: () => null,
}))
vi.mock('@/services/waitlist', () => ({
  joinWaitlist: vi.fn().mockResolvedValue({}),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockEvent = {
  id: 'ev1',
  title: 'Evento Incrível',
  description: 'Descrição do evento',
  slug: 'evento-incrivel',
  startDate: '2026-08-10',
  endDate: '2026-08-10',
  startTime: '09:00',
  endTime: '18:00',
  location: 'São Paulo, SP',
  isOnline: false,
  bannerUrl: null,
  logoUrl: null,
  primaryColor: '#5B21B6',
  workloadHours: 8,
  pageSettings: null,
  pageBlocks: [],
}

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/e/evento-incrivel']}>
        <Routes>
          <Route path="/e/:slug" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PublicEventPage', () => {
  it('exibe spinner de carregamento enquanto o evento carrega', () => {
    vi.mocked(usePublicEventModule.usePublicEvent).mockReturnValue({ event: null, isLoading: true })
    vi.mocked(usePublicEventModule.useAvailableTickets).mockReturnValue({ tickets: [], isLoading: false })
    vi.mocked(usePublicEventModule.useRegisterForEvent).mockReturnValue({ register: vi.fn(), isPending: false })
    render(<PublicEventPage />, { wrapper: makeWrapper() })
    expect(screen.getByText(/carregando evento/i)).toBeInTheDocument()
  })

  it('exibe mensagem de evento não encontrado quando event é null e não está carregando', () => {
    vi.mocked(usePublicEventModule.usePublicEvent).mockReturnValue({ event: null, isLoading: false })
    vi.mocked(usePublicEventModule.useAvailableTickets).mockReturnValue({ tickets: [], isLoading: false })
    vi.mocked(usePublicEventModule.useRegisterForEvent).mockReturnValue({ register: vi.fn(), isPending: false })
    render(<PublicEventPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Evento não encontrado')).toBeInTheDocument()
  })

  it('renderiza o título do evento quando carregado', () => {
    vi.mocked(usePublicEventModule.usePublicEvent).mockReturnValue({ event: mockEvent as never, isLoading: false })
    vi.mocked(usePublicEventModule.useAvailableTickets).mockReturnValue({ tickets: [], isLoading: false })
    vi.mocked(usePublicEventModule.useRegisterForEvent).mockReturnValue({ register: vi.fn(), isPending: false })
    render(<PublicEventPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Evento Incrível')).toBeInTheDocument()
  })

  it('renderiza o formulário de inscrição', () => {
    vi.mocked(usePublicEventModule.usePublicEvent).mockReturnValue({ event: mockEvent as never, isLoading: false })
    vi.mocked(usePublicEventModule.useAvailableTickets).mockReturnValue({ tickets: [], isLoading: false })
    vi.mocked(usePublicEventModule.useRegisterForEvent).mockReturnValue({ register: vi.fn(), isPending: false })
    render(<PublicEventPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Sua inscrição')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('João da Silva')).toBeInTheDocument()
  })

  it('renderiza a seção "Sobre o evento"', () => {
    vi.mocked(usePublicEventModule.usePublicEvent).mockReturnValue({ event: mockEvent as never, isLoading: false })
    vi.mocked(usePublicEventModule.useAvailableTickets).mockReturnValue({ tickets: [], isLoading: false })
    vi.mocked(usePublicEventModule.useRegisterForEvent).mockReturnValue({ register: vi.fn(), isPending: false })
    render(<PublicEventPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Sobre o evento')).toBeInTheDocument()
  })
})
