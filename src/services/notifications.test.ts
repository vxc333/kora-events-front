import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getParticipantNotifications, markNotificationRead, markAllNotificationsRead } from './notifications'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockNotification = {
  id: 'notif-1',
  type: 'CONFIRMATION',
  title: 'Inscrição confirmada',
  body: 'Sua inscrição foi confirmada.',
  readAt: null,
  createdAt: '2026-05-01T10:00:00.000Z',
}

beforeEach(() => vi.clearAllMocks())

describe('getParticipantNotifications', () => {
  it('chama GET /notifications com qrToken e retorna lista de notificações', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockNotification] })
    const result = await getParticipantNotifications('qr-abc')
    expect(api.get).toHaveBeenCalledWith('/notifications', { params: { qrToken: 'qr-abc' } })
    expect(result).toEqual([mockNotification])
  })
})

describe('markNotificationRead', () => {
  it('chama POST /notifications/:id/read', async () => {
    vi.mocked(api.post).mockResolvedValue({})
    await markNotificationRead('notif-1')
    expect(api.post).toHaveBeenCalledWith('/notifications/notif-1/read')
  })
})

describe('markAllNotificationsRead', () => {
  it('chama POST /notifications/read-all com qrToken', async () => {
    vi.mocked(api.post).mockResolvedValue({})
    await markAllNotificationsRead('qr-abc')
    expect(api.post).toHaveBeenCalledWith('/notifications/read-all', { qrToken: 'qr-abc' })
  })
})
