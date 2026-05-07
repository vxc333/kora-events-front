import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { MinimumAttendanceTab } from './MinimumAttendanceTab'

vi.mock('@/services/minimumAttendance')

import * as attendanceService from '@/services/minimumAttendance'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

const mockSummary = {
  minimumPercentage: 75,
  eligible: 8,
  total: 10,
  records: [
    {
      participantId: 'p1',
      participantName: 'Ana Oliveira',
      participantEmail: 'ana@example.com',
      totalSessions: 4,
      attendedSessions: 4,
      percentage: 100,
      certificateEligible: true,
    },
    {
      participantId: 'p2',
      participantName: 'Carlos Lima',
      participantEmail: 'carlos@example.com',
      totalSessions: 4,
      attendedSessions: 2,
      percentage: 50,
      certificateEligible: false,
    },
  ],
}

describe('MinimumAttendanceTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe estado vazio quando não há sessões configuradas', async () => {
    vi.mocked(attendanceService.getMinimumAttendance).mockResolvedValue({
      minimumPercentage: 75,
      eligible: 0,
      total: 0,
      records: [],
    })
    wrap(<MinimumAttendanceTab eventId="e1" />)
    expect(await screen.findByText('Nenhuma sessão configurada')).toBeInTheDocument()
  })

  it('renderiza linhas de participantes quando há dados', async () => {
    vi.mocked(attendanceService.getMinimumAttendance).mockResolvedValue(mockSummary)
    wrap(<MinimumAttendanceTab eventId="e1" />)
    expect(await screen.findByText('Ana Oliveira')).toBeInTheDocument()
    expect(screen.getByText('Carlos Lima')).toBeInTheDocument()
  })

  it('exibe percentual de frequência mínima exigida', async () => {
    vi.mocked(attendanceService.getMinimumAttendance).mockResolvedValue(mockSummary)
    wrap(<MinimumAttendanceTab eventId="e1" />)
    expect(await screen.findByText('75%')).toBeInTheDocument()
  })

  it('exibe contagem de elegíveis vs total', async () => {
    vi.mocked(attendanceService.getMinimumAttendance).mockResolvedValue(mockSummary)
    wrap(<MinimumAttendanceTab eventId="e1" />)
    expect(await screen.findByText('8')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
