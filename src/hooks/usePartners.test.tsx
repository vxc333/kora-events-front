import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  useUploadPartnerLogo,
} from './usePartners'
import * as partnersService from '@/services/partners'
import type { EventPartner } from '@/types/partners'

vi.mock('@/services/partners')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockPartner: EventPartner = {
  id: 'partner-1',
  eventId: 'event-1',
  name: 'Parceiro Exemplo',
  logoUrl: null,
  displayOrder: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('usePartners', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna lista vazia antes de resolver', () => {
    vi.mocked(partnersService.getPartners).mockResolvedValue([mockPartner])
    const { result } = renderHook(() => usePartners('event-1'), { wrapper: makeWrapper() })
    expect(result.current.partners).toEqual([])
  })

  it('retorna parceiros após query resolver', async () => {
    vi.mocked(partnersService.getPartners).mockResolvedValue([mockPartner])
    const { result } = renderHook(() => usePartners('event-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.partners).toHaveLength(1)
    expect(result.current.partners[0].name).toBe('Parceiro Exemplo')
  })

  it('não executa query quando eventId está vazio', () => {
    vi.mocked(partnersService.getPartners).mockResolvedValue([])
    const { result } = renderHook(() => usePartners(''), { wrapper: makeWrapper() })
    expect(partnersService.getPartners).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useCreatePartner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama partnersService.createPartner com os argumentos corretos', async () => {
    vi.mocked(partnersService.createPartner).mockResolvedValue(mockPartner)
    const { result } = renderHook(() => useCreatePartner('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.createPartner({ name: 'Parceiro Exemplo', displayOrder: 1 })
    })
    await waitFor(() =>
      expect(partnersService.createPartner).toHaveBeenCalledWith('event-1', {
        name: 'Parceiro Exemplo',
        displayOrder: 1,
      }),
    )
  })
})

describe('useUpdatePartner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama partnersService.updatePartner com os argumentos corretos', async () => {
    vi.mocked(partnersService.updatePartner).mockResolvedValue(mockPartner)
    const { result } = renderHook(() => useUpdatePartner('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.updatePartner({ partnerId: 'partner-1', data: { name: 'Parceiro Atualizado' } })
    })
    await waitFor(() =>
      expect(partnersService.updatePartner).toHaveBeenCalledWith('event-1', 'partner-1', {
        name: 'Parceiro Atualizado',
      }),
    )
  })
})

describe('useDeletePartner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama partnersService.deletePartner com o id correto', async () => {
    vi.mocked(partnersService.deletePartner).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeletePartner('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.deletePartner('partner-1')
    })
    await waitFor(() =>
      expect(partnersService.deletePartner).toHaveBeenCalledWith('event-1', 'partner-1'),
    )
  })
})

describe('useUploadPartnerLogo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama partnersService.uploadPartnerLogo com os argumentos corretos', async () => {
    vi.mocked(partnersService.uploadPartnerLogo).mockResolvedValue(mockPartner)
    const { result } = renderHook(() => useUploadPartnerLogo('event-1'), {
      wrapper: makeWrapper(),
    })
    const mockFile = new File(['logo'], 'logo.png', { type: 'image/png' })
    await act(async () => {
      result.current.uploadLogo({ partnerId: 'partner-1', file: mockFile })
    })
    await waitFor(() =>
      expect(partnersService.uploadPartnerLogo).toHaveBeenCalledWith(
        'event-1',
        'partner-1',
        mockFile,
      ),
    )
  })
})
