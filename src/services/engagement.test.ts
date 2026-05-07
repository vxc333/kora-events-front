import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getEngagementSummary } from './engagement'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockSummary = {
  totalCertificateDownloads: 120,
  averageEmailOpenRate: 45.5,
  averageCheckinRate: 78.2,
  averageNps: 42,
  events: [
    {
      eventId: 'ev-1',
      eventTitle: 'Festival Tech',
      certificateDownloads: 50,
      emailOpenRate: 50,
      returnParticipants: 10,
      checkinRate: 80,
      npsAverage: 42,
    },
  ],
}

beforeEach(() => vi.clearAllMocks())

describe('getEngagementSummary', () => {
  it('chama GET /analytics/engagement e retorna resumo de engajamento', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockSummary })
    const result = await getEngagementSummary()
    expect(api.get).toHaveBeenCalledWith('/analytics/engagement')
    expect(result).toEqual(mockSummary)
  })
})
