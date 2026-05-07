import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getMembers, inviteMember, updateMemberRole, removeMember } from './members'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockMember = {
  id: 'mem-1',
  eventId: 'ev-1',
  userId: 'u-1',
  role: 'CHECKIN' as const,
  user: { id: 'u-1', name: 'Carlos', email: 'carlos@test.com' },
}

beforeEach(() => vi.clearAllMocks())

describe('getMembers', () => {
  it('chama GET /events/:id/members e retorna lista de membros', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockMember] })
    const result = await getMembers('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/members')
    expect(result).toEqual([mockMember])
  })
})

describe('inviteMember', () => {
  it('chama POST /events/:id/members e retorna o membro convidado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockMember })
    const input = { email: 'carlos@test.com', role: 'CHECKIN' as const }
    const result = await inviteMember('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/members', input)
    expect(result).toEqual(mockMember)
  })
})

describe('updateMemberRole', () => {
  it('chama PATCH /events/:id/members/:mid com novo role e retorna membro atualizado', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { ...mockMember, role: 'ADMIN' } })
    const result = await updateMemberRole('ev-1', 'mem-1', 'ADMIN')
    expect(api.patch).toHaveBeenCalledWith('/events/ev-1/members/mem-1', { role: 'ADMIN' })
    expect(result.role).toBe('ADMIN')
  })
})

describe('removeMember', () => {
  it('chama DELETE /events/:id/members/:mid', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await removeMember('ev-1', 'mem-1')
    expect(api.delete).toHaveBeenCalledWith('/events/ev-1/members/mem-1')
  })
})
