import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { EventNpsTab } from './EventNpsTab'

vi.mock('@/services/nps')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import * as npsService from '@/services/nps'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

const mockNpsData = {
  eventId: 'e1',
  totalResponses: 50,
  averageScore: 8.4,
  npsScore: 62,
  promoters: 30,
  passives: 15,
  detractors: 5,
  comments: [
    { score: 9, comment: 'Ótimo evento!', createdAt: '2026-05-01T10:00:00.000Z' },
    { score: 6, comment: null, createdAt: '2026-05-01T11:00:00.000Z' },
  ],
}

describe('EventNpsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe estado vazio quando não há respostas NPS', async () => {
    vi.mocked(npsService.getEventNps).mockResolvedValue({
      ...mockNpsData,
      totalResponses: 0,
    })
    wrap(<EventNpsTab eventId="e1" />)
    expect(await screen.findByText('Nenhuma resposta NPS ainda')).toBeInTheDocument()
  })

  it('exibe cards KPI quando há dados NPS', async () => {
    vi.mocked(npsService.getEventNps).mockResolvedValue(mockNpsData)
    wrap(<EventNpsTab eventId="e1" />)
    expect(await screen.findByText('50')).toBeInTheDocument()
    expect(screen.getByText('+62')).toBeInTheDocument()
  })

  it('exibe NPS Score e Total de Respostas', async () => {
    vi.mocked(npsService.getEventNps).mockResolvedValue(mockNpsData)
    wrap(<EventNpsTab eventId="e1" />)
    expect(await screen.findByText('NPS Score')).toBeInTheDocument()
    expect(screen.getByText('Total de Respostas')).toBeInTheDocument()
  })

  it('exibe comentários recentes quando presentes', async () => {
    vi.mocked(npsService.getEventNps).mockResolvedValue(mockNpsData)
    wrap(<EventNpsTab eventId="e1" />)
    expect(await screen.findByText('Ótimo evento!')).toBeInTheDocument()
  })
})
