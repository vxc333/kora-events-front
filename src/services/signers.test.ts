import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getSigners, createSigner, updateSigner, deleteSigner, uploadSignerSignature } from './signers'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockSigner = {
  id: 'sig-1',
  name: 'Dr. João',
  role: 'Diretor',
  signatureUrl: null,
  eventId: 'ev-1',
}

beforeEach(() => vi.clearAllMocks())

describe('getSigners', () => {
  it('chama GET /events/:id/signers e retorna lista de signatários', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockSigner] })
    const result = await getSigners('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/signers')
    expect(result).toEqual([mockSigner])
  })
})

describe('createSigner', () => {
  it('chama POST /events/:id/signers e retorna o signatário criado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockSigner })
    const input = { name: 'Dr. João', role: 'Diretor' }
    const result = await createSigner('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/signers', input)
    expect(result).toEqual(mockSigner)
  })
})

describe('updateSigner', () => {
  it('chama PATCH /events/:id/signers/:sid e retorna o signatário atualizado', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: mockSigner })
    const result = await updateSigner('ev-1', 'sig-1', { role: 'Coordenador' })
    expect(api.patch).toHaveBeenCalledWith('/events/ev-1/signers/sig-1', { role: 'Coordenador' })
    expect(result).toEqual(mockSigner)
  })
})

describe('deleteSigner', () => {
  it('chama DELETE /events/:id/signers/:sid', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await deleteSigner('ev-1', 'sig-1')
    expect(api.delete).toHaveBeenCalledWith('/events/ev-1/signers/sig-1')
  })
})

describe('uploadSignerSignature', () => {
  it('chama POST /events/:id/signers/:sid/signature com FormData e retorna signatário', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockSigner, signatureUrl: '/assinatura.png' } })
    const file = new File(['img'], 'assinatura.png', { type: 'image/png' })
    const result = await uploadSignerSignature('ev-1', 'sig-1', file)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/signers/sig-1/signature', expect.any(FormData))
    expect(result.signatureUrl).toBe('/assinatura.png')
  })
})
