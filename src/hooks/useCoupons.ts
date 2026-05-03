import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as couponsService from '@/services/coupons'
import type { CreateCouponInput, UpdateCouponInput } from '@/types/coupons'

export function useCoupons(eventId: string) {
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons', eventId],
    queryFn: () => couponsService.getCoupons(eventId),
    enabled: !!eventId,
  })
  return { coupons: coupons ?? [], isLoading }
}

export function useCreateCoupon(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: CreateCouponInput) => couponsService.createCoupon(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', eventId] })
      toast.success('Cupom criado!')
    },
  })
  return { createCoupon: mutation.mutate, isPending: mutation.isPending }
}

export function useUpdateCoupon(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ couponId, data }: { couponId: string; data: UpdateCouponInput }) =>
      couponsService.updateCoupon(eventId, couponId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', eventId] })
      toast.success('Cupom atualizado!')
    },
  })
  return { updateCoupon: mutation.mutate, isPending: mutation.isPending }
}

export function useDeactivateCoupon(eventId: string) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (couponId: string) => couponsService.deactivateCoupon(eventId, couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', eventId] })
      toast.success('Cupom desativado.')
    },
  })
  return { deactivateCoupon: mutation.mutate, isPending: mutation.isPending }
}
