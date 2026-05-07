import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { registerPushToken } from './pushNotifications'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockPushToken = {
  id: 'pt-1',
  fcmToken: 'fcm-token-abc',
  qrToken: null,
  userId: null,
  createdAt: '2026-05-01T00:00:00.000Z',
}

beforeEach(() => vi.clearAllMocks())

describe('registerPushToken', () => {
  it('chama POST /push-tokens com fcmToken e retorna token registrado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockPushToken })
    const result = await registerPushToken('fcm-token-abc')
    expect(api.post).toHaveBeenCalledWith('/push-tokens', { fcmToken: 'fcm-token-abc' })
    expect(result).toEqual(mockPushToken)
  })

  it('inclui qrToken e userId opcionais quando fornecidos', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockPushToken, qrToken: 'qr-1', userId: 'u-1' } })
    const result = await registerPushToken('fcm-token-abc', { qrToken: 'qr-1', userId: 'u-1' })
    expect(api.post).toHaveBeenCalledWith('/push-tokens', {
      fcmToken: 'fcm-token-abc',
      qrToken: 'qr-1',
      userId: 'u-1',
    })
    expect(result.qrToken).toBe('qr-1')
  })
})
