import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { EngagementWidget } from './EngagementWidget'

vi.mock('@/services/engagement')

import * as engagementService from '@/services/engagement'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('EngagementWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não renderiza nada quando não há dados', async () => {
    vi.mocked(engagementService.getEngagementSummary).mockResolvedValue({
      events: [],
      totalCertificateDownloads: 0,
      averageEmailOpenRate: 0,
      averageCheckinRate: 0,
      averageNps: null,
    })
    const { container } = wrap(<EngagementWidget />)
    // Wait for the query to settle — give React time to process
    await new Promise((r) => setTimeout(r, 100))
    expect(container.firstChild).toBeNull()
  })

  it('renderiza métricas quando há dados disponíveis', async () => {
    vi.mocked(engagementService.getEngagementSummary).mockResolvedValue({
      events: [
        {
          eventId: 'e1',
          eventTitle: 'Evento Teste',
          certificateDownloads: 42,
          emailOpenRate: 65,
          returnParticipants: 10,
          checkinRate: 80,
          npsAverage: 72,
        },
      ],
      totalCertificateDownloads: 42,
      averageEmailOpenRate: 65.7,
      averageCheckinRate: 80.0,
      averageNps: 72,
    })
    wrap(<EngagementWidget />)
    expect(await screen.findByText('Engajamento pós-evento')).toBeInTheDocument()
    // Wait for the actual value to appear (loading skeletons replaced)
    expect(await screen.findByText('42')).toBeInTheDocument()
  })
})
