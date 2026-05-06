import { useQuery } from '@tanstack/react-query'
import { getFinancialSummary } from '@/services/financeiro'

export function useFinanceiro() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['financeiro'],
    queryFn: getFinancialSummary,
    staleTime: 60_000,
  })

  return {
    summary: data,
    isLoading,
    isError,
  }
}
