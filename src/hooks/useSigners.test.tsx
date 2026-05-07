import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import {
  useSigners,
  useCreateSigner,
  useUpdateSigner,
  useDeleteSigner,
  useUploadSignerSignature,
} from './useSigners'
import * as signersService from '@/services/signers'
import type { CertificateSigner } from '@/types/signers'

vi.mock('@/services/signers')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockSigner: CertificateSigner = {
  id: 'signer-1',
  eventId: 'event-1',
  name: 'Dr. Carlos',
  title: 'Diretor Acadêmico',
  signatureUrl: null,
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

describe('useSigners', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna lista vazia antes de resolver', () => {
    vi.mocked(signersService.getSigners).mockResolvedValue([mockSigner])
    const { result } = renderHook(() => useSigners('event-1'), { wrapper: makeWrapper() })
    expect(result.current.signers).toEqual([])
  })

  it('retorna assinantes após query resolver', async () => {
    vi.mocked(signersService.getSigners).mockResolvedValue([mockSigner])
    const { result } = renderHook(() => useSigners('event-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.signers).toHaveLength(1)
    expect(result.current.signers[0].name).toBe('Dr. Carlos')
  })

  it('não executa query quando eventId está vazio', () => {
    vi.mocked(signersService.getSigners).mockResolvedValue([])
    const { result } = renderHook(() => useSigners(''), { wrapper: makeWrapper() })
    expect(signersService.getSigners).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useCreateSigner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama signersService.createSigner com os argumentos corretos', async () => {
    vi.mocked(signersService.createSigner).mockResolvedValue(mockSigner)
    const { result } = renderHook(() => useCreateSigner('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.createSigner({ name: 'Dr. Carlos', title: 'Diretor Acadêmico' })
    })
    await waitFor(() =>
      expect(signersService.createSigner).toHaveBeenCalledWith('event-1', {
        name: 'Dr. Carlos',
        title: 'Diretor Acadêmico',
      }),
    )
  })
})

describe('useUpdateSigner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama signersService.updateSigner com os argumentos corretos', async () => {
    vi.mocked(signersService.updateSigner).mockResolvedValue(mockSigner)
    const { result } = renderHook(() => useUpdateSigner('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.updateSigner({ signerId: 'signer-1', data: { title: 'Coordenador' } })
    })
    await waitFor(() =>
      expect(signersService.updateSigner).toHaveBeenCalledWith('event-1', 'signer-1', {
        title: 'Coordenador',
      }),
    )
  })
})

describe('useDeleteSigner', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama signersService.deleteSigner com o id correto', async () => {
    vi.mocked(signersService.deleteSigner).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteSigner('event-1'), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.deleteSigner('signer-1')
    })
    await waitFor(() =>
      expect(signersService.deleteSigner).toHaveBeenCalledWith('event-1', 'signer-1'),
    )
  })
})

describe('useUploadSignerSignature', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chama signersService.uploadSignerSignature com os argumentos corretos', async () => {
    vi.mocked(signersService.uploadSignerSignature).mockResolvedValue(mockSigner)
    const { result } = renderHook(() => useUploadSignerSignature('event-1'), {
      wrapper: makeWrapper(),
    })
    const mockFile = new File(['signature'], 'assinatura.png', { type: 'image/png' })
    await act(async () => {
      result.current.uploadSignature({ signerId: 'signer-1', file: mockFile })
    })
    await waitFor(() =>
      expect(signersService.uploadSignerSignature).toHaveBeenCalledWith(
        'event-1',
        'signer-1',
        mockFile,
      ),
    )
  })
})
