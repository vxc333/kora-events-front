import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getEventNps, exportNpsCsv } from './nps'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockNpsSummary = {
  eventId: 'ev-1',
  totalResponses: 50,
  averageScore: 8.2,
  npsScore: 40,
  promoters: 25,
  passives: 15,
  detractors: 10,
  comments: [],
}

beforeEach(() => vi.clearAllMocks())

describe('getEventNps', () => {
  it('chama GET /events/:id/nps e retorna resumo do NPS', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockNpsSummary })
    const result = await getEventNps('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/nps')
    expect(result).toEqual(mockNpsSummary)
  })
})

describe('exportNpsCsv', () => {
  it('chama GET /events/:id/nps/export com responseType blob', async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:url')
    URL.revokeObjectURL = vi.fn()
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(['csv']) })
    await exportNpsCsv('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/nps/export', { responseType: 'blob' })
  })
})
