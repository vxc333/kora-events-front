import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as eventsService from '@/services/events'
import type { UpdateEventInput } from '@/types/events'
import type { PageBlock, PageSettings } from '@/types/page-builder'

export function useEvent(id: string) {
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEvent(id),
    enabled: !!id,
  })
  return { event: event ?? null, isLoading }
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: eventsService.createEvent,
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento criado!')
      navigate(`/events/${event.id}`)
    },
  })

  return {
    createEvent: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (data: UpdateEventInput) => eventsService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento atualizado!')
      navigate(`/events/${id}`)
    },
  })

  return {
    updateEvent: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}

export function usePublishEvent(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => eventsService.publishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento publicado!')
    },
  })

  return { publish: mutation.mutate, isPending: mutation.isPending }
}

export function useCancelEvent(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => eventsService.cancelEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento cancelado.')
    },
  })

  return { cancel: mutation.mutate, isPending: mutation.isPending }
}

export function useUploadEventImage(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ type, file }: { type: 'banner' | 'logo'; file: File }) =>
      eventsService.uploadEventImage(id, type, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      toast.success('Imagem atualizada!')
    },
  })

  return { upload: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdatePageBuilder(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: { pageBlocks: PageBlock[]; pageSettings: PageSettings }) =>
      eventsService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      toast.success('Página salva!')
    },
  })

  return { savePage: mutation.mutate, isPending: mutation.isPending }
}

export function useDownloadAttendanceReport(eventId: string) {
  const mutation = useMutation({
    mutationFn: () => eventsService.downloadAttendanceReport(eventId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-presenca.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Relatório baixado!')
    },
    onError: () => toast.error('Erro ao gerar relatório de presença.'),
  })

  return { downloadReport: mutation.mutate, isPending: mutation.isPending }
}
