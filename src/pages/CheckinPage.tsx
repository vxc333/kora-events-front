import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, QrCode, Wifi, WifiOff } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { useCheckinQueue } from '@/hooks/useCheckinQueue'
import type { EventSummary } from '@/types/events'

const STATUS_DOT: Record<string, string> = {
  PUBLISHED: '#4ADE80',
  ONGOING: '#34D399',
  DRAFT: '#6B7280',
  FINISHED: '#60A5FA',
  CANCELLED: '#F87171',
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Publicado',
  ONGOING: 'Em andamento',
  DRAFT: 'Rascunho',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

function EventCard({ event }: { event: EventSummary }) {
  const dot = STATUS_DOT[event.status] ?? '#6B7280'
  const label = STATUS_LABEL[event.status] ?? event.status
  const date = new Date(event.startDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <Link
      to={`/checkin/${event.id}`}
      className="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/4 px-4 py-4 transition-all duration-200 hover:border-violet-500/40 hover:bg-violet-500/8 active:scale-98"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${dot}18`, border: `1px solid ${dot}30` }}
      >
        <QrCode size={20} style={{ color: dot }} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white/90 group-hover:text-white">
          {event.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: dot }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
            {label}
          </span>
          <span className="text-white/25">·</span>
          <span className="flex items-center gap-1 text-xs text-white/40">
            <CalendarDays size={10} />
            {date}
          </span>
        </div>
      </div>

      <ChevronRight size={16} className="shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-400" />
    </Link>
  )
}

export function CheckinPage() {
  const { events, isLoading } = useEvents({ limit: 50 })
  const { isOnline, queueCount } = useCheckinQueue()

  const scannable = events.filter((e) => ['PUBLISHED', 'ONGOING'].includes(e.status))
  const others = events.filter((e) => !['PUBLISHED', 'ONGOING'].includes(e.status))

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: '#0D0B18',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-black/40 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}
          >
            <QrCode size={15} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase">Kora</p>
            <p className="-mt-0.5 text-sm font-bold text-white">Check-in</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queueCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-400">
              {queueCount} offline
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: isOnline ? '#4ADE80' : '#F87171' }}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-18 animate-pulse rounded-xl bg-white/4" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
              <CalendarDays size={28} className="text-violet-400" />
            </div>
            <p className="text-sm font-medium text-white/60">Nenhum evento encontrado.</p>
            <p className="mt-1 text-xs text-white/30">Crie um evento para começar.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {scannable.length > 0 && (
              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                  Prontos para check-in
                </p>
                <div className="space-y-2">
                  {scannable.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/20">
                  Outros eventos
                </p>
                <div className="space-y-2 opacity-50">
                  {others.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
