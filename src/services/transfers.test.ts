import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { initiateTransfer } from './transfers'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockTransferResult = {
  token: 'transfer-token-xyz',
  status: 'PENDING',
  recipientEmail: 'novo@test.com',
}

beforeEach(() => vi.clearAllMocks())

describe('initiateTransfer', () => {
  it('chama POST /events/:id/transfers e retorna resultado da transferência', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockTransferResult })
    const result = await initiateTransfer('ev-1', 'qr-abc', 'novo@test.com')
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/transfers', {
      qrToken: 'qr-abc',
      recipientEmail: 'novo@test.com',
    })
    expect(result).toEqual(mockTransferResult)
  })
})
