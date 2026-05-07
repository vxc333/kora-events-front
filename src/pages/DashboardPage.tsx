import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Wifi, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEvents } from '@/hooks/useEvents'
import { EngagementWidget } from '@/components/EngagementWidget'
import type { EventStatus } from '@/types/events'

const LIMIT = 10

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  ONGOING: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

const STATUS_CLASSES: Record<EventStatus, string> = {
  DRAFT: 'border-transparent bg-slate-100 text-slate-600',
  PUBLISHED: 'border-transparent bg-violet-100 text-violet-700',
  ONGOING: 'border-transparent bg-emerald-100 text-emerald-700',
  FINISHED: 'border-transparent bg-blue-100 text-blue-700',
  CANCELLED: 'border-transparent bg-red-100 text-red-600',
}

const FILTERS: Array<{ label: string; value: EventStatus | undefined }> = [
  { label: 'Todos', value: undefined },
  { label: 'Rascunho', value: 'DRAFT' },
  { label: 'Publicado', value: 'PUBLISHED' },
  { label: 'Em andamento', value: 'ONGOING' },
  { label: 'Finalizado', value: 'FINISHED' },
  { label: 'Cancelado', value: 'CANCELLED' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function DashboardPage() {
  const [status, setStatus] = useState<EventStatus | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { events, total, isLoading } = useEvents({ page, limit: LIMIT, status })

  function handleFilter(value: EventStatus | undefined) {
    setStatus(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Full-width sticky page header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-8 py-5"
        style={{
          background: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h1
            className="text-2xl text-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Meus eventos
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Gerencie e acompanhe todos os seus eventos
          </p>
        </div>
        <Link to="/events/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo evento
          </Button>
        </Link>
      </header>

      {/* Page content */}
      <div className="p-8 space-y-6">
        {/* Engagement widget */}
        <EngagementWidget />

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              aria-label={f.label}
              onClick={() => handleFilter(f.value)}
              className={
                status === f.value
                  ? 'inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium bg-brand text-white transition-all cursor-pointer'
                  : 'inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium bg-bg border border-border text-text-muted hover:border-brand/40 hover:text-text transition-all cursor-pointer'
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div data-testid="loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
              <CalendarDays className="h-7 w-7 text-brand/60" />
            </div>
            <p className="text-base font-medium text-text">Nenhum evento encontrado.</p>
            <p className="text-sm text-text-muted mt-1 mb-6">
              {status ? 'Tente outro filtro ou crie um novo evento.' : 'Comece criando o seu primeiro evento.'}
            </p>
            <Link to="/events/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Criar evento
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="group relative rounded-xl border border-border bg-bg p-5 hover:border-brand/30 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                {/* Status + date row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <Badge className={STATUS_CLASSES[event.status]}>
                    {STATUS_LABELS[event.status]}
                  </Badge>
                </div>

                {/* Title */}
                <Link
                  to={`/events/${event.id}`}
                  className="text-sm font-semibold text-text group-hover:text-brand transition-colors line-clamp-2 leading-snug"
                >
                  {event.title}
                </Link>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-text-muted mt-auto">
                  {event.isOnline ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location ?? '—'}</span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {events.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-text-muted">Página {page}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page * LIMIT >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
