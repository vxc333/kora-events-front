import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getMarketplaceEvents } from './marketplace'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockResponse = {
  data: [
    {
      id: 'ev-1',
      slug: 'festival-tech',
      title: 'Festival Tech',
      description: null,
      bannerUrl: null,
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-06-02T00:00:00.000Z',
      location: 'São Paulo',
      isOnline: false,
      primaryColor: '#6366f1',
      ticketsAvailable: 100,
      minPrice: 0,
      category: 'TECNOLOGIA',
      featured: true,
    },
  ],
  total: 1,
  page: 1,
}

beforeEach(() => vi.clearAllMocks())

describe('getMarketplaceEvents', () => {
  it('chama GET /marketplace/events sem filtros e retorna resposta paginada', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResponse })
    const result = await getMarketplaceEvents()
    expect(api.get).toHaveBeenCalledWith('/marketplace/events', { params: {} })
    expect(result).toEqual(mockResponse)
  })

  it('repassa filtros de busca para os params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResponse })
    await getMarketplaceEvents({ search: 'tech', category: 'TECNOLOGIA', page: 2, limit: 5 })
    expect(api.get).toHaveBeenCalledWith('/marketplace/events', {
      params: { search: 'tech', category: 'TECNOLOGIA', page: 2, limit: 5 },
    })
  })

  it('repassa filtro free quando definido', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockResponse })
    await getMarketplaceEvents({ free: true })
    expect(api.get).toHaveBeenCalledWith('/marketplace/events', {
      params: { free: true },
    })
  })
})
