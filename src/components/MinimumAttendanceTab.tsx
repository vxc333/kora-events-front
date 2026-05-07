import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle, Search, Users, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getMinimumAttendance } from "@/services/minimumAttendance"
import type { AttendanceRecord } from "@/services/minimumAttendance"

interface Props {
  eventId: string
}

function rowBarColor(record: AttendanceRecord): string {
  if (record.certificateEligible) return "from-emerald-500 to-emerald-400"
  if (record.percentage >= 60) return "from-amber-500 to-amber-400"
  return "from-red-500 to-red-400"
}

export function MinimumAttendanceTab({ eventId }: Props) {
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["minimum-attendance", eventId],
    queryFn: () => getMinimumAttendance(eventId),
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        {/* Header stats skeleton */}
        <div className="rounded-xl border border-border bg-bg p-5 space-y-3">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        {/* Search skeleton */}
        <Skeleton className="h-9 w-full rounded-md" />
        {/* Table skeleton */}
        <div className="rounded-xl border border-border bg-bg divide-y divide-border overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
        <Users className="h-10 w-10 text-text-disabled mx-auto" />
        <div>
          <p className="text-sm font-medium text-text">Nenhuma sessão configurada</p>
          <p className="text-xs text-text-muted mt-1">
            Configure sessões e registre presenças para visualizar o controle de frequência mínima.
          </p>
        </div>
      </div>
    )
  }

  const overallRate = data.total > 0 ? Math.round((data.eligible / data.total) * 100) : 0

  const filtered = data.records.filter(
    (r) =>
      r.participantName.toLowerCase().includes(search.toLowerCase()) ||
      r.participantEmail.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="rounded-xl border border-border bg-bg p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-text">
              <span className="text-2xl font-bold text-brand">{data.eligible}</span>
              <span className="text-text-muted"> de </span>
              <span className="text-2xl font-bold text-text">{data.total}</span>
              <span className="text-text-muted"> participantes atingiram o mínimo</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Frequência mínima exigida:{" "}
              <span className="font-semibold text-text">{data.minimumPercentage}%</span>
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
              overallRate >= 75
                ? "bg-emerald-100 text-emerald-700"
                : overallRate >= 50
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {overallRate}% elegíveis
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="h-2.5 w-full rounded-full bg-bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all ${
                overallRate >= 75
                  ? "from-emerald-500 to-emerald-400"
                  : overallRate >= 50
                    ? "from-amber-500 to-amber-400"
                    : "from-red-500 to-red-400"
              }`}
              style={{ width: `${overallRate}%` }}
            />
          </div>
          <p className="text-[11px] text-text-disabled">
            {data.total - data.eligible} participante{data.total - data.eligible !== 1 ? "s" : ""} abaixo do mínimo
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
        <input
          type="search"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-bg pl-9 pr-3 text-sm text-text placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Search className="h-7 w-7 text-text-disabled mx-auto mb-2" />
          <p className="text-sm text-text-muted">Nenhum participante encontrado.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-bg overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-bg-subtle border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wide">
            <span>Participante</span>
            <span className="text-right">Sessões</span>
            <span className="w-32 text-center">Frequência</span>
            <span className="text-center">Elegível</span>
          </div>

          <ul className="divide-y divide-border">
            {filtered.map((record) => (
              <RecordRow key={record.participantId} record={record} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RecordRow({ record }: { record: AttendanceRecord }) {
  return (
    <li className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3.5">
      {/* Name + email */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-text truncate">{record.participantName}</p>
        <p className="text-xs text-text-muted truncate">{record.participantEmail}</p>
      </div>

      {/* Sessions X/Y */}
      <span className="text-sm text-text-muted tabular-nums text-right flex-shrink-0">
        <span className="font-semibold text-text">{record.attendedSessions}</span>/{record.totalSessions}
      </span>

      {/* Percentage bar */}
      <div className="w-32 space-y-1 flex-shrink-0">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-muted">Frequência</span>
          <span className={`font-semibold ${record.certificateEligible ? "text-emerald-600" : record.percentage >= 60 ? "text-amber-600" : "text-red-600"}`}>
            {record.percentage}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${rowBarColor(record)} transition-all`}
            style={{ width: `${Math.min(record.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Eligibility badge */}
      <div className="flex-shrink-0 flex items-center justify-center">
        {record.certificateEligible ? (
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
      </div>
    </li>
  )
}
