import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardPage } from './DashboardPage'
import * as useEventsModule from '@/hooks/useEvents'

vi.mock('@/hooks/useEvents')

const mockEvents = [
  {
    id: '1', title: 'Evento Alpha', status: 'PUBLISHED' as const,
    startDate: '2026-06-01T00:00:00.000Z', endDate: '2026-06-01T00:00:00.000Z',
    location: 'São Paulo', isOnline: false,
  },
  {
    id: '2', title: 'Evento Beta', status: 'DRAFT' as const,
    startDate: '2026-07-01T00:00:00.000Z', endDate: '2026-07-01T00:00:00.000Z',
    location: null, isOnline: true,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardPage', () => {
  it('renderiza título e badge de status de cada evento', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: mockEvents, total: 2, isLoading: false,
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText('Evento Alpha')).toBeInTheDocument()
    expect(screen.getByText('Evento Beta')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(within(list).getByText('Publicado')).toBeInTheDocument()
    expect(within(list).getByText('Rascunho')).toBeInTheDocument()
  })

  it('exibe área de loading durante isLoading', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: [], total: 0, isLoading: true,
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('exibe mensagem quando lista está vazia', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: [], total: 0, isLoading: false,
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByText('Nenhum evento encontrado.')).toBeInTheDocument()
  })

  it('botão Anterior desabilitado na página 1', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: mockEvents, total: 2, isLoading: false,
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled()
  })

  it('botão Próxima desabilitado quando total <= limit', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: mockEvents, total: 2, isLoading: false,
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /próxima/i })).toBeDisabled()
  })

  it('selecionar filtro Publicado chama useEvents com status PUBLISHED', async () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: [], total: 0, isLoading: false,
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /^publicado$/i }))
    expect(vi.mocked(useEventsModule.useEvents)).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'PUBLISHED', page: 1 })
    )
  })

  it('renderiza título do evento como link para /events/:id', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: mockEvents, total: 2, isLoading: false,
    })
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Evento Alpha' })).toHaveAttribute('href', '/events/1')
  })
})
