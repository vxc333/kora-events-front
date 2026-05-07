import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getWhiteLabelConfig, updateWhiteLabelConfig } from './whiteLabelAccount'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockConfig = {
  id: 'wl-1',
  userId: 'u-1',
  customDomain: null,
  logoUrl: null,
  primaryColor: '#6366f1',
  accentColor: null,
  hidePoweredBy: false,
}

beforeEach(() => vi.clearAllMocks())

describe('getWhiteLabelConfig', () => {
  it('chama GET /account/white-label e retorna configuração', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockConfig })
    const result = await getWhiteLabelConfig()
    expect(api.get).toHaveBeenCalledWith('/account/white-label')
    expect(result).toEqual(mockConfig)
  })
})

describe('updateWhiteLabelConfig', () => {
  it('chama PUT /account/white-label com dados e retorna configuração atualizada', async () => {
    const updated = { ...mockConfig, primaryColor: '#ff0000' }
    vi.mocked(api.put).mockResolvedValue({ data: updated })
    const result = await updateWhiteLabelConfig({ primaryColor: '#ff0000' })
    expect(api.put).toHaveBeenCalledWith('/account/white-label', { primaryColor: '#ff0000' })
    expect(result.primaryColor).toBe('#ff0000')
  })
})
