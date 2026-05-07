import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { portalLogin, getPortalEvents, downloadPortalCertificate } from './participantPortal'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockPortalAuth = {
  qrToken: 'qr-portal-abc',
  participantName: 'Maria',
  participantEmail: 'maria@test.com',
}

const mockPortalEvent = {
  eventId: 'ev-1',
  eventTitle: 'Festival Tech',
  eventDate: '2026-06-01T00:00:00.000Z',
  eventSlug: 'festival-tech',
  status: 'CONFIRMED' as const,
  checkedInAt: null,
  certificateAvailable: true,
  ticketName: 'Ingresso Geral',
}

beforeEach(() => vi.clearAllMocks())

describe('portalLogin', () => {
  it('chama POST /portal/login com cpf e email e retorna auth do portal', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockPortalAuth })
    const result = await portalLogin('000.000.000-00', 'maria@test.com')
    expect(api.post).toHaveBeenCalledWith('/portal/login', {
      cpf: '000.000.000-00',
      email: 'maria@test.com',
    })
    expect(result).toEqual(mockPortalAuth)
  })
})

describe('getPortalEvents', () => {
  it('chama GET /portal/events com qrToken e retorna lista de eventos do participante', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockPortalEvent] })
    const result = await getPortalEvents('qr-portal-abc')
    expect(api.get).toHaveBeenCalledWith('/portal/events', { params: { qrToken: 'qr-portal-abc' } })
    expect(result).toEqual([mockPortalEvent])
  })
})

describe('downloadPortalCertificate', () => {
  it('chama GET /portal/certificate/:eventId com qrToken e responseType blob', async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:url')
    URL.revokeObjectURL = vi.fn()
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(['pdf']) })
    await downloadPortalCertificate('qr-portal-abc', 'ev-1')
    expect(api.get).toHaveBeenCalledWith('/portal/certificate/ev-1', {
      params: { qrToken: 'qr-portal-abc' },
      responseType: 'blob',
    })
  })
})
