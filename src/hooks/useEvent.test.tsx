import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useEvent, useCreateEvent, usePublishEvent, useCancelEvent } from './useEvent'
import * as eventsService from '@/services/events'
import type { EventDetail } from '@/types/events'

vi.mock('@/services/events')
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

const mockEvent: EventDetail = {
  id: 'uuid-1',
  slug: 'festival-tech-2026',
  title: 'Festival Tech 2026',
  description: 'Maior festival de tecnologia do Brasil.',
  status: 'DRAFT',
  bannerUrl: null,
  logoUrl: null,
  startDate: '2026-06-01T00:00:00.000Z',
  endDate: '2026-06-02T00:00:00.000Z',
  startTime: '09:00',
  endTime: '18:00',
  location: 'Av. Paulista, 1000',
  onlineLink: null,
  isOnline: false,
  minimumAttendancePercentage: 75,
  workloadHours: 8,
  isPublic: true,
  requiresApproval: false,
  maxParticipants: null,
  primaryColor: '#6366f1',
  certificateTemplate: 'DEFAULT',
  organizerId: 'org-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('useEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna null e isLoading false quando id está vazio', () => {
    const { result } = renderHook(() => useEvent(''), { wrapper: makeWrapper() })
    expect(result.current.event).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('retorna o evento após query resolver', async () => {
    vi.mocked(eventsService.getEvent).mockResolvedValue(mockEvent)
    const { result } = renderHook(() => useEvent('uuid-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.event).toEqual(mockEvent)
  })
})

describe('useCreateEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama eventsService.createEvent na mutation', async () => {
    vi.mocked(eventsService.createEvent).mockResolvedValue(mockEvent)
    const { result } = renderHook(() => useCreateEvent(), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.createEvent({
        title: 'Festival Tech 2026',
        description: 'Desc',
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-02T00:00:00.000Z',
        startTime: '09:00',
        endTime: '18:00',
        workloadHours: 8,
      })
    })
    await waitFor(() => expect(eventsService.createEvent).toHaveBeenCalled())
  })
})

describe('usePublishEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama eventsService.publishEvent', async () => {
    vi.mocked(eventsService.publishEvent).mockResolvedValue({ ...mockEvent, status: 'PUBLISHED' })
    const { result } = renderHook(() => usePublishEvent('uuid-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.publish()
    })
    await waitFor(() => expect(eventsService.publishEvent).toHaveBeenCalledWith('uuid-1'))
  })
})

describe('useCancelEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama eventsService.cancelEvent', async () => {
    vi.mocked(eventsService.cancelEvent).mockResolvedValue({ ...mockEvent, status: 'CANCELLED' })
    const { result } = renderHook(() => useCancelEvent('uuid-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.cancel()
    })
    await waitFor(() => expect(eventsService.cancelEvent).toHaveBeenCalledWith('uuid-1'))
  })
})
