import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useEvents } from './useEvents'
import * as eventsService from '@/services/events'
import type { EventsPage } from '@/types/events'

vi.mock('@/services/events')

const mockPage: EventsPage = {
  data: [
    {
      id: '1', title: 'Evento Alpha', status: 'PUBLISHED',
      startDate: '2026-06-01T00:00:00.000Z', endDate: '2026-06-01T00:00:00.000Z',
      location: 'São Paulo', isOnline: false,
    },
  ],
  total: 1, page: 1, limit: 10,
}

let queryClient: QueryClient

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useEvents', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.clearAllMocks()
  })

  it('retorna events vazio antes de resolver', () => {
    vi.mocked(eventsService.getMyEvents).mockResolvedValue(mockPage)
    const { result } = renderHook(() => useEvents({}), { wrapper })
    expect(result.current.events).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('retorna eventos e total após query resolver', async () => {
    vi.mocked(eventsService.getMyEvents).mockResolvedValue(mockPage)
    const { result } = renderHook(() => useEvents({}), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].title).toBe('Evento Alpha')
    expect(result.current.total).toBe(1)
  })
})
