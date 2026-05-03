import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as partnersService from '@/services/partners'
import type { CreatePartnerInput, UpdatePartnerInput } from '@/types/partners'

export function usePartners(eventId: string) {
  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners', eventId],
    queryFn: () => partnersService.getPartners(eventId),
    enabled: !!eventId,
  })
  return { partners: partners ?? [], isLoading }
}

export function useCreatePartner(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: CreatePartnerInput) => partnersService.createPartner(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', eventId] })
      toast.success('Parceiro adicionado!')
    },
  })
  return { createPartner: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdatePartner(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: UpdatePartnerInput }) =>
      partnersService.updatePartner(eventId, partnerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', eventId] })
      toast.success('Parceiro atualizado!')
    },
  })
  return { updatePartner: mutation.mutate, isPending: mutation.isPending }
}

export function useDeletePartner(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (partnerId: string) => partnersService.deletePartner(eventId, partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', eventId] })
      toast.success('Parceiro removido.')
    },
  })
  return { deletePartner: mutation.mutate, isPending: mutation.isPending }
}

export function useUploadPartnerLogo(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ partnerId, file }: { partnerId: string; file: File }) =>
      partnersService.uploadPartnerLogo(eventId, partnerId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', eventId] })
      toast.success('Logo atualizada!')
    },
  })
  return { uploadLogo: mutation.mutate, isPending: mutation.isPending }
}
