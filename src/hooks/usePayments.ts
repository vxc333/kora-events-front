import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkoutPix, checkoutBoleto, getPaymentStatus, refundPayment } from '@/services/payments'

export function usePaymentStatus(paymentId: string | null) {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getPaymentStatus(paymentId!),
    enabled: !!paymentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'PENDING' ? 5000 : false
    },
  })
}

export function useCheckoutPix() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (participantId: string) => checkoutPix(participantId),
    onSuccess: (payment) => {
      queryClient.setQueryData(['payment', payment.id], payment)
    },
  })
}

export function useCheckoutBoleto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (participantId: string) => checkoutBoleto(participantId),
    onSuccess: (payment) => {
      queryClient.setQueryData(['payment', payment.id], payment)
    },
  })
}

export function useRefundPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (paymentId: string) => refundPayment(paymentId),
    onSuccess: (payment) => {
      queryClient.setQueryData(['payment', payment.id], payment)
      queryClient.invalidateQueries({ queryKey: ['event-payments', payment.eventId] })
    },
  })
}
