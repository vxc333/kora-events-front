import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { joinWaitlist } from './waitlist'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockEntry = {
  id: 'wl-1',
  name: 'Pedro Silva',
  email: 'pedro@test.com',
  status: 'WAITING',
}

beforeEach(() => vi.clearAllMocks())

describe('joinWaitlist', () => {
  it('chama POST /events/:id/waitlist e retorna a entrada na lista de espera', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockEntry })
    const input = {
      ticketId: 'tick-1',
      name: 'Pedro Silva',
      email: 'pedro@test.com',
      cpf: '000.000.000-00',
      phone: '11999999999',
    }
    const result = await joinWaitlist('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/waitlist', input)
    expect(result).toEqual(mockEntry)
  })
})
