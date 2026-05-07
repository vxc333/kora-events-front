import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getPartners, createPartner, updatePartner, deletePartner, uploadPartnerLogo } from './partners'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockPartner = {
  id: 'par-1',
  name: 'Parceiro A',
  logoUrl: null,
  tier: 'GOLD',
  eventId: 'ev-1',
}

beforeEach(() => vi.clearAllMocks())

describe('getPartners', () => {
  it('chama GET /events/:id/partners e retorna lista de parceiros', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockPartner] })
    const result = await getPartners('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/partners')
    expect(result).toEqual([mockPartner])
  })
})

describe('createPartner', () => {
  it('chama POST /events/:id/partners e retorna o parceiro criado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockPartner })
    const input = { name: 'Parceiro A', tier: 'GOLD' as const }
    const result = await createPartner('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/partners', input)
    expect(result).toEqual(mockPartner)
  })
})

describe('updatePartner', () => {
  it('chama PATCH /events/:id/partners/:pid e retorna o parceiro atualizado', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: mockPartner })
    const result = await updatePartner('ev-1', 'par-1', { name: 'Novo Nome' })
    expect(api.patch).toHaveBeenCalledWith('/events/ev-1/partners/par-1', { name: 'Novo Nome' })
    expect(result).toEqual(mockPartner)
  })
})

describe('deletePartner', () => {
  it('chama DELETE /events/:id/partners/:pid', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await deletePartner('ev-1', 'par-1')
    expect(api.delete).toHaveBeenCalledWith('/events/ev-1/partners/par-1')
  })
})

describe('uploadPartnerLogo', () => {
  it('chama POST /events/:id/partners/:pid/logo com FormData e retorna parceiro', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockPartner, logoUrl: '/logo.png' } })
    const file = new File(['img'], 'logo.png', { type: 'image/png' })
    const result = await uploadPartnerLogo('ev-1', 'par-1', file)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/partners/par-1/logo', expect.any(FormData))
    expect(result.logoUrl).toBe('/logo.png')
  })
})
