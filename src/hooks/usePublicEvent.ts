import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as publicService from '@/services/public'
import type { RegisterInput } from '@/services/public'

export function usePublicEvent(slug: string) {
  const { data: event, isLoading } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => publicService.getPublicEvent(slug),
    enabled: !!slug,
    retry: false,
  })
  return { event: event ?? null, isLoading }
}

export function useAvailableTickets(eventId: string) {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['available-tickets', eventId],
    queryFn: () => publicService.getAvailableTickets(eventId),
    enabled: !!eventId,
  })
  return { tickets: tickets ?? [], isLoading }
}

export function useRegisterForEvent(eventId: string, eventSlug: string) {
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: (data: RegisterInput) => publicService.registerForEvent(eventId, data),
    onSuccess: (result) => {
      navigate(`/e/${eventSlug}/confirmacao`, { state: { registration: result } })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Erro ao realizar inscrição. Tente novamente.')
    },
  })
  return { register: mutation.mutate, isPending: mutation.isPending }
}
