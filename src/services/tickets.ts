import { api } from '@/lib/api'
import type { Ticket, CreateTicketInput, UpdateTicketInput } from '@/types/tickets'

export async function getTickets(eventId: string): Promise<Ticket[]> {
  const res = await api.get<Ticket[]>(`/events/${eventId}/tickets`)
  return res.data
}

export async function createTicket(eventId: string, data: CreateTicketInput): Promise<Ticket> {
  const res = await api.post<Ticket>(`/events/${eventId}/tickets`, data)
  return res.data
}

export async function updateTicket(
  eventId: string,
  ticketId: string,
  data: UpdateTicketInput,
): Promise<Ticket> {
  const res = await api.patch<Ticket>(`/events/${eventId}/tickets/${ticketId}`, data)
  return res.data
}

export async function deleteTicket(eventId: string, ticketId: string): Promise<void> {
  await api.delete(`/events/${eventId}/tickets/${ticketId}`)
}
