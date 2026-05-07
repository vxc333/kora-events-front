import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getMinimumAttendance } from './minimumAttendance'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockSummary = {
  minimumPercentage: 75,
  eligible: 80,
  total: 100,
  records: [
    {
      participantId: 'p-1',
      participantName: 'Ana',
      participantEmail: 'ana@test.com',
      totalSessions: 4,
      attendedSessions: 3,
      percentage: 75,
      certificateEligible: true,
    },
  ],
}

beforeEach(() => vi.clearAllMocks())

describe('getMinimumAttendance', () => {
  it('chama GET /events/:id/minimum-attendance e retorna resumo de frequência', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockSummary })
    const result = await getMinimumAttendance('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/minimum-attendance')
    expect(result).toEqual(mockSummary)
  })
})
