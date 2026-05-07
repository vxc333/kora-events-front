import { useQuery } from '@tanstack/react-query'
import { BarChart2, Award, Mail, RefreshCw, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getEngagementSummary } from '@/services/engagement'

function Metric({
  icon,
  label,
  value,
  suffix = '',
  accent,
  loading,
}: {
  icon: React.ReactNode
  label: string
  value: number | null
  suffix?: string
  accent: string
  loading?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl p-4"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
        style={{ background: `${accent}15`, border: `1px solid ${accent}28` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-5 w-16 rounded mb-1" />
        ) : (
          <p
            className="text-lg font-semibold tabular-nums leading-none"
            style={{ color: value === null ? 'var(--color-text-disabled)' : 'var(--color-text)' }}
          >
            {value === null ? '—' : `${value}${suffix}`}
          </p>
        )}
        <p className="text-[11px] text-text-muted mt-1 leading-none truncate">{label}</p>
      </div>
    </div>
  )
}

export function EngagementWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['engagement-summary'],
    queryFn: getEngagementSummary,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const hasData = !!data && data.events.length > 0

  if (!isLoading && !hasData) return null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <BarChart2 className="h-4 w-4 text-text-muted" />
        <h3 className="text-sm font-semibold text-text">Engajamento pós-evento</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
        <Metric
          icon={<Award className="h-4 w-4" />}
          label="Certificados baixados"
          value={data?.totalCertificateDownloads ?? null}
          accent="#10b981"
          loading={isLoading}
        />
        <Metric
          icon={<Mail className="h-4 w-4" />}
          label="Taxa de abertura email"
          value={data ? Math.round(data.averageEmailOpenRate) : null}
          suffix="%"
          accent="#f59e0b"
          loading={isLoading}
        />
        <Metric
          icon={<RefreshCw className="h-4 w-4" />}
          label="Taxa média de check-in"
          value={data ? Math.round(data.averageCheckinRate) : null}
          suffix="%"
          accent="var(--color-brand)"
          loading={isLoading}
        />
        <Metric
          icon={<Star className="h-4 w-4" />}
          label="NPS médio"
          value={data?.averageNps !== undefined ? (data.averageNps !== null ? Math.round(data.averageNps) : null) : null}
          accent="#8b5cf6"
          loading={isLoading}
        />
      </div>
    </div>
  )
}
