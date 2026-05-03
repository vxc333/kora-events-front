import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as participantsService from '@/services/participants'
import type { CreateParticipantInput, UpdateParticipantInput, ListParticipantsParams } from '@/types/participants'

export function useParticipants(eventId: string, params?: ListParticipantsParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['participants', eventId, params],
    queryFn: () => participantsService.getParticipants(eventId, params),
    enabled: !!eventId,
  })
  return {
    participants: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
  }
}

export function useCreateParticipant(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: CreateParticipantInput) =>
      participantsService.createParticipant(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] })
      toast.success('Participante adicionado!')
    },
  })
  return { createParticipant: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdateParticipant(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({
      participantId,
      data,
    }: {
      participantId: string
      data: UpdateParticipantInput
    }) => participantsService.updateParticipant(eventId, participantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] })
      toast.success('Participante atualizado!')
    },
  })
  return { updateParticipant: mutation.mutate, isPending: mutation.isPending }
}

export function useCancelParticipant(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (participantId: string) =>
      participantsService.cancelParticipant(eventId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] })
      toast.success('Inscrição cancelada.')
    },
  })
  return { cancelParticipant: mutation.mutate, isPending: mutation.isPending }
}

export function useImportParticipantsCsv(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (file: File) => participantsService.importParticipantsCsv(eventId, file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] })
      toast.success(`${result.imported} participantes importados!`)
    },
  })
  return { importCsv: mutation.mutate, isPending: mutation.isPending }
}
