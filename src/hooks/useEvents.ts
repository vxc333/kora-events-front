import { useQuery } from '@tanstack/react-query'
import { getMyEvents } from '@/services/events'
import type { GetMyEventsParams, EventSummary } from '@/types/events'

export function useEvents(params: GetMyEventsParams): {
  events: EventSummary[]
  total: number
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: ['events', params],
    queryFn: () => getMyEvents(params),
  })

  return {
    events: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
  }
}
