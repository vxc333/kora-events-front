import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import {
  performCheckin,
  performCheckinByCpf,
  performCheckinByName,
  getCheckinStats,
  getAuditLog,
  exportInstitutional,
} from './checkin'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockCheckinResult = {
  id: 'p-1',
  name: 'Ana',
  email: 'ana@test.com',
  eventId: 'ev-1',
  checkedInAt: '2026-06-01T10:00:00.000Z',
}

const mockStats = { total: 100, checkedIn: 60, pending: 40 }

beforeEach(() => vi.clearAllMocks())

describe('performCheckin', () => {
  it('chama POST /checkin/:token e retorna resultado do check-in', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockCheckinResult })
    const result = await performCheckin('qr-token-abc')
    expect(api.post).toHaveBeenCalledWith('/checkin/qr-token-abc')
    expect(result).toEqual(mockCheckinResult)
  })
})

describe('performCheckinByCpf', () => {
  it('chama POST /checkin/by-cpf com cpf e eventId', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockCheckinResult })
    const result = await performCheckinByCpf('000.000.000-00', 'ev-1')
    expect(api.post).toHaveBeenCalledWith('/checkin/by-cpf', { cpf: '000.000.000-00', eventId: 'ev-1' })
    expect(result).toEqual(mockCheckinResult)
  })
})

describe('performCheckinByName', () => {
  it('chama POST /checkin/by-name com name e eventId', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockCheckinResult })
    const result = await performCheckinByName('Ana', 'ev-1')
    expect(api.post).toHaveBeenCalledWith('/checkin/by-name', { name: 'Ana', eventId: 'ev-1' })
    expect(result).toEqual(mockCheckinResult)
  })
})

describe('getCheckinStats', () => {
  it('chama GET /events/:id/checkin/stats e retorna estatísticas', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockStats })
    const result = await getCheckinStats('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/checkin/stats')
    expect(result).toEqual(mockStats)
  })
})

describe('getAuditLog', () => {
  it('chama GET /events/:id/checkin/audit-log e retorna logs', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    const result = await getAuditLog('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/checkin/audit-log')
    expect(result).toEqual([])
  })
})

describe('exportInstitutional', () => {
  it('chama GET /events/:id/participants/export-institutional com responseType blob', async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:url')
    URL.revokeObjectURL = vi.fn()
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(['csv']) })
    await exportInstitutional('ev-1', 'Meu Evento')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/participants/export-institutional', {
      responseType: 'blob',
    })
  })
})
