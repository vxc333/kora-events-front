import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as signersService from '@/services/signers'
import type { CreateSignerInput, UpdateSignerInput } from '@/types/signers'

export function useSigners(eventId: string) {
  const { data: signers, isLoading } = useQuery({
    queryKey: ['signers', eventId],
    queryFn: () => signersService.getSigners(eventId),
    enabled: !!eventId,
  })
  return { signers: signers ?? [], isLoading }
}

export function useCreateSigner(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: CreateSignerInput) => signersService.createSigner(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signers', eventId] })
      toast.success('Assinante adicionado!')
    },
  })
  return { createSigner: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdateSigner(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ signerId, data }: { signerId: string; data: UpdateSignerInput }) =>
      signersService.updateSigner(eventId, signerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signers', eventId] })
      toast.success('Assinante atualizado!')
    },
  })
  return { updateSigner: mutation.mutate, isPending: mutation.isPending }
}

export function useDeleteSigner(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (signerId: string) => signersService.deleteSigner(eventId, signerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signers', eventId] })
      toast.success('Assinante removido.')
    },
  })
  return { deleteSigner: mutation.mutate, isPending: mutation.isPending }
}

export function useUploadSignerSignature(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ signerId, file }: { signerId: string; file: File }) =>
      signersService.uploadSignerSignature(eventId, signerId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signers', eventId] })
      toast.success('Assinatura atualizada!')
    },
  })
  return { uploadSignature: mutation.mutate, isPending: mutation.isPending }
}
