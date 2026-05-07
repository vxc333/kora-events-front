import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getBroadcasts, sendBroadcast } from './broadcasts'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockBroadcast = {
  id: 'br-1',
  subject: 'Lembrete de evento',
  body: 'Não esqueça do evento amanhã!',
  segment: 'ALL' as const,
  sentAt: '2026-05-01T10:00:00.000Z',
  recipientCount: 50,
}

beforeEach(() => vi.clearAllMocks())

describe('getBroadcasts', () => {
  it('chama GET /events/:id/broadcasts e retorna lista de broadcasts', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockBroadcast] })
    const result = await getBroadcasts('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/broadcasts')
    expect(result).toEqual([mockBroadcast])
  })
})

describe('sendBroadcast', () => {
  it('chama POST /events/:id/broadcasts/send e retorna o broadcast enviado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockBroadcast })
    const input = { subject: 'Lembrete', body: 'Texto', segment: 'CONFIRMED' as const }
    const result = await sendBroadcast('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/broadcasts/send', input)
    expect(result).toEqual(mockBroadcast)
  })
})
