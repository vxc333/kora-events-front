import { api } from '@/lib/api'

export type MemberRole = 'ADMIN' | 'CHECKIN' | 'FINANCEIRO'

export interface EventMember {
  id: string
  eventId: string
  userId: string
  role: MemberRole
  user: { id: string; name: string; email: string }
}

export interface InviteMemberInput {
  email: string
  role: MemberRole
}

export async function getMembers(eventId: string): Promise<EventMember[]> {
  const res = await api.get<EventMember[]>(`/events/${eventId}/members`)
  return res.data
}

export async function inviteMember(eventId: string, data: InviteMemberInput): Promise<EventMember> {
  const res = await api.post<EventMember>(`/events/${eventId}/members`, data)
  return res.data
}

export async function updateMemberRole(
  eventId: string,
  memberId: string,
  role: MemberRole,
): Promise<EventMember> {
  const res = await api.patch<EventMember>(`/events/${eventId}/members/${memberId}`, { role })
  return res.data
}

export async function removeMember(eventId: string, memberId: string): Promise<void> {
  await api.delete(`/events/${eventId}/members/${memberId}`)
}
