import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as ticketsService from '@/services/tickets'
import type { CreateTicketInput, UpdateTicketInput } from '@/types/tickets'

export function useTickets(eventId: string) {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', eventId],
    queryFn: () => ticketsService.getTickets(eventId),
    enabled: !!eventId,
  })
  return { tickets: tickets ?? [], isLoading }
}

export function useCreateTicket(eventId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateTicketInput) => ticketsService.createTicket(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] })
      toast.success('Ingresso criado!')
    },
  })

  return { createTicket: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdateTicket(eventId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: UpdateTicketInput }) =>
      ticketsService.updateTicket(eventId, ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] })
      toast.success('Ingresso atualizado!')
    },
  })

  return { updateTicket: mutation.mutate, isPending: mutation.isPending }
}

export function useDeleteTicket(eventId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (ticketId: string) => ticketsService.deleteTicket(eventId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', eventId] })
      toast.success('Ingresso removido.')
    },
  })

  return { deleteTicket: mutation.mutate, isPending: mutation.isPending }
}
