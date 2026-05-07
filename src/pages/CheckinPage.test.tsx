import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CheckinPage } from './CheckinPage'
import * as useEventsModule from '@/hooks/useEvents'
import * as useCheckinQueueModule from '@/hooks/useCheckinQueue'

vi.mock('@/hooks/useEvents')
vi.mock('@/hooks/useCheckinQueue')

const mockEvents = [
  {
    id: '1',
    title: 'Evento Publicado',
    status: 'PUBLISHED' as const,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-01T00:00:00.000Z',
    location: 'São Paulo',
    isOnline: false,
  },
  {
    id: '2',
    title: 'Evento Encerrado',
    status: 'FINISHED' as const,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-01-01T00:00:00.000Z',
    location: null,
    isOnline: false,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCheckinQueueModule.useCheckinQueue).mockReturnValue({
    isOnline: true,
    queueCount: 0,
    isSyncing: false,
    addToQueue: vi.fn(),
    sync: vi.fn(),
  })
})

describe('CheckinPage', () => {
  it('renderiza o cabeçalho Check-in', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: [], total: 0, isLoading: false,
    })
    render(<MemoryRouter><CheckinPage /></MemoryRouter>)
    expect(screen.getByText('Check-in')).toBeInTheDocument()
  })

  it('exibe estado de carregamento com skeletons', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: [], total: 0, isLoading: true,
    })
    render(<MemoryRouter><CheckinPage /></MemoryRouter>)
    const pulseEls = document.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)
  })

  it('exibe mensagem quando não há eventos', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: [], total: 0, isLoading: false,
    })
    render(<MemoryRouter><CheckinPage /></MemoryRouter>)
    expect(screen.getByText('Nenhum evento encontrado.')).toBeInTheDocument()
  })

  it('renderiza seção "Prontos para check-in" com eventos publicados', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: mockEvents, total: 2, isLoading: false,
    })
    render(<MemoryRouter><CheckinPage /></MemoryRouter>)
    expect(screen.getByText('Prontos para check-in')).toBeInTheDocument()
    expect(screen.getByText('Evento Publicado')).toBeInTheDocument()
  })

  it('exibe indicador de status online', () => {
    vi.mocked(useEventsModule.useEvents).mockReturnValue({
      events: [], total: 0, isLoading: false,
    })
    render(<MemoryRouter><CheckinPage /></MemoryRouter>)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })
})
