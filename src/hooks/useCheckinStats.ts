import { useQuery } from '@tanstack/react-query'
import { getCheckinStats } from '@/services/checkin'

export function useCheckinStats(eventId: string) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['checkin-stats', eventId],
    queryFn: () => getCheckinStats(eventId),
    refetchInterval: 5000,
    staleTime: 3000,
    enabled: !!eventId,
  })

  return {
    stats: data ?? { total: 0, checkedIn: 0, pending: 0 },
    isLoading,
    refetch,
  }
}
