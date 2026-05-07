import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import {
  useParticipants,
  useCreateParticipant,
  useUpdateParticipant,
  useCancelParticipant,
  useImportParticipantsCsv,
} from './useParticipants'
import * as participantsService from '@/services/participants'
import type { Participant, PaginatedParticipants } from '@/types/participants'

vi.mock('@/services/participants')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockParticipant: Participant = {
  id: 'participant-1',
  eventId: 'event-1',
  ticketId: null,
  couponId: null,
  name: 'João Silva',
  email: 'joao@example.com',
  cpf: null,
  status: 'CONFIRMED',
  qrToken: 'token-abc',
  checkedInAt: null,
  certificateReleased: false,
  registeredAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockPaginated: PaginatedParticipants = {
  data: [mockParticipant],
  total: 1,
  page: 1,
  limit: 10,
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useParticipants', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna lista vazia e total zero antes de resolver', () => {
    vi.mocked(participantsService.getParticipants).mockResolvedValue(mockPaginated)
    const { result } = renderHook(() => useParticipants('event-1'), { wrapper: makeWrapper() })
    expect(result.current.participants).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('retorna participantes e total após query resolver', async () => {
    vi.mocked(participantsService.getParticipants).mockResolvedValue(mockPaginated)
    const { result } = renderHook(() => useParticipants('event-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.participants).toHaveLength(1)
    expect(result.current.participants[0].name).toBe('João Silva')
    expect(result.current.total).toBe(1)
  })

  it('não executa query quando eventId está vazio', () => {
    vi.mocked(participantsService.getParticipants).mockResolvedValue(mockPaginated)
    const { result } = renderHook(() => useParticipants(''), { wrapper: makeWrapper() })
    expect(participantsService.getParticipants).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useCreateParticipant', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama participantsService.createParticipant com os argumentos corretos', async () => {
    vi.mocked(participantsService.createParticipant).mockResolvedValue(mockParticipant)
    const { result } = renderHook(() => useCreateParticipant('event-1'), {
      wrapper: makeWrapper(),
    })
    await act(async () => {
      result.current.createParticipant({ name: 'João Silva', email: 'joao@example.com' })
    })
    await waitFor(() =>
      expect(participantsService.createParticipant).toHaveBeenCalledWith('event-1', {
        name: 'João Silva',
        email: 'joao@example.com',
      }),
    )
  })
})

describe('useUpdateParticipant', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama participantsService.updateParticipant com os argumentos corretos', async () => {
    vi.mocked(participantsService.updateParticipant).mockResolvedValue(mockParticipant)
    const { result } = renderHook(() => useUpdateParticipant('event-1'), {
      wrapper: makeWrapper(),
    })
    await act(async () => {
      result.current.updateParticipant({ participantId: 'participant-1', data: { name: 'João Atualizado' } })
    })
    await waitFor(() =>
      expect(participantsService.updateParticipant).toHaveBeenCalledWith(
        'event-1',
        'participant-1',
        { name: 'João Atualizado' },
      ),
    )
  })
})

describe('useCancelParticipant', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama participantsService.cancelParticipant com o id correto', async () => {
    vi.mocked(participantsService.cancelParticipant).mockResolvedValue(undefined)
    const { result } = renderHook(() => useCancelParticipant('event-1'), {
      wrapper: makeWrapper(),
    })
    await act(async () => {
      result.current.cancelParticipant('participant-1')
    })
    await waitFor(() =>
      expect(participantsService.cancelParticipant).toHaveBeenCalledWith('event-1', 'participant-1'),
    )
  })
})

describe('useImportParticipantsCsv', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama participantsService.importParticipantsCsv com o arquivo correto', async () => {
    vi.mocked(participantsService.importParticipantsCsv).mockResolvedValue({ imported: 3 })
    const { result } = renderHook(() => useImportParticipantsCsv('event-1'), {
      wrapper: makeWrapper(),
    })
    const mockFile = new File(['nome,email'], 'participantes.csv', { type: 'text/csv' })
    await act(async () => {
      result.current.importCsv(mockFile)
    })
    await waitFor(() =>
      expect(participantsService.importParticipantsCsv).toHaveBeenCalledWith('event-1', mockFile),
    )
  })
})
