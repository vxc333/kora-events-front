import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getSessions, createSession, updateSession, deleteSession } from './eventSessions'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockSession = {
  id: 'ses-1',
  eventId: 'ev-1',
  title: 'Palestra Principal',
  description: null,
  startDate: '2026-06-01',
  endDate: '2026-06-01',
  startTime: '09:00',
  endTime: '11:00',
  sessionCheckins: [],
}

beforeEach(() => vi.clearAllMocks())

describe('getSessions', () => {
  it('chama GET /events/:id/sessions e retorna lista de sessões', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockSession] })
    const result = await getSessions('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/sessions')
    expect(result).toEqual([mockSession])
  })
})

describe('createSession', () => {
  it('chama POST /events/:id/sessions e retorna a sessão criada', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockSession })
    const input = {
      title: 'Palestra Principal',
      startDate: '2026-06-01',
      endDate: '2026-06-01',
      startTime: '09:00',
    }
    const result = await createSession('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/sessions', input)
    expect(result).toEqual(mockSession)
  })
})

describe('updateSession', () => {
  it('chama PATCH /events/:id/sessions/:sid e retorna a sessão atualizada', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: mockSession })
    const result = await updateSession('ev-1', 'ses-1', { title: 'Novo Título' })
    expect(api.patch).toHaveBeenCalledWith('/events/ev-1/sessions/ses-1', { title: 'Novo Título' })
    expect(result).toEqual(mockSession)
  })
})

describe('deleteSession', () => {
  it('chama DELETE /events/:id/sessions/:sid', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await deleteSession('ev-1', 'ses-1')
    expect(api.delete).toHaveBeenCalledWith('/events/ev-1/sessions/ses-1')
  })
})
