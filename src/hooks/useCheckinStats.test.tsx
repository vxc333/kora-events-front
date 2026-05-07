import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useCheckinStats } from './useCheckinStats'
import * as checkinService from '@/services/checkin'
import type { CheckinStats } from '@/services/checkin'

vi.mock('@/services/checkin')

const mockStats: CheckinStats = {
  total: 100,
  checkedIn: 40,
  pending: 60,
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useCheckinStats', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna stats com valores zerados antes de resolver', () => {
    vi.mocked(checkinService.getCheckinStats).mockResolvedValue(mockStats)
    const { result } = renderHook(() => useCheckinStats('event-1'), { wrapper: makeWrapper() })
    expect(result.current.stats).toEqual({ total: 0, checkedIn: 0, pending: 0 })
  })

  it('retorna estatísticas de checkin após query resolver', async () => {
    vi.mocked(checkinService.getCheckinStats).mockResolvedValue(mockStats)
    const { result } = renderHook(() => useCheckinStats('event-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.stats.total).toBe(100)
    expect(result.current.stats.checkedIn).toBe(40)
    expect(result.current.stats.pending).toBe(60)
  })

  it('não executa query quando eventId está vazio', () => {
    vi.mocked(checkinService.getCheckinStats).mockResolvedValue(mockStats)
    const { result } = renderHook(() => useCheckinStats(''), { wrapper: makeWrapper() })
    expect(checkinService.getCheckinStats).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })

  it('expõe a função refetch', () => {
    vi.mocked(checkinService.getCheckinStats).mockResolvedValue(mockStats)
    const { result } = renderHook(() => useCheckinStats('event-1'), { wrapper: makeWrapper() })
    expect(typeof result.current.refetch).toBe('function')
  })
})
