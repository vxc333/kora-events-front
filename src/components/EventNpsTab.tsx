import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Download, MessageSquare, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getEventNps, exportNpsCsv } from "@/services/nps"

interface Props {
  eventId: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  if (days === 1) return "ontem"
  if (days < 30) return `${days}d atrás`
  const months = Math.floor(days / 30)
  return `${months} ${months === 1 ? "mês" : "meses"} atrás`
}

function npsColor(score: number): string {
  if (score > 50) return "text-emerald-600"
  if (score >= 0) return "text-amber-600"
  return "text-red-600"
}

function npsLabel(score: number): string {
  if (score > 75) return "Excelente"
  if (score > 50) return "Bom"
  if (score > 0) return "Neutro"
  if (score === 0) return "Neutro"
  return "Crítico"
}

function scoreBadgeClass(score: number): string {
  if (score >= 9) return "bg-emerald-100 text-emerald-700"
  if (score >= 7) return "bg-amber-100 text-amber-700"
  return "bg-red-100 text-red-600"
}

export function EventNpsTab({ eventId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["nps", eventId],
    queryFn: () => getEventNps(eventId),
  })

  async function handleExport() {
    try {
      await exportNpsCsv(eventId)
    } catch {
      toast.error("Erro ao exportar CSV.")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        {/* KPI skeletons */}
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-bg p-5 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        {/* Gauge skeleton */}
        <div className="rounded-xl border border-border bg-bg p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-full rounded-full" />
          <div className="flex gap-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {/* Comments skeleton */}
        <div className="rounded-xl border border-border bg-bg p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5 py-3 border-t border-border first:border-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-8 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.totalResponses === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
        <TrendingUp className="h-10 w-10 text-text-disabled mx-auto" />
        <div>
          <p className="text-sm font-medium text-text">Nenhuma resposta NPS ainda</p>
          <p className="text-xs text-text-muted mt-1">
            As respostas aparecerão aqui assim que os participantes preencherem a pesquisa de satisfação.
          </p>
        </div>
      </div>
    )
  }

  const total = data.totalResponses
  const promotersPct = total > 0 ? Math.round((data.promoters / total) * 100) : 0
  const passivesPct = total > 0 ? Math.round((data.passives / total) * 100) : 0
  const detractorsPct = total > 0 ? Math.round((data.detractors / total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex items-center justify-end">
        <Button variant="secondary" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total respostas */}
        <div className="rounded-xl border border-border bg-bg p-5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Users className="h-3.5 w-3.5" />
            Total de Respostas
          </div>
          <p className="text-3xl font-bold text-text">{data.totalResponses}</p>
          <p className="text-xs text-text-muted">participantes responderam</p>
        </div>

        {/* Nota média */}
        <div className="rounded-xl border border-border bg-bg p-5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <TrendingUp className="h-3.5 w-3.5" />
            Nota Média
          </div>
          <p className="text-3xl font-bold text-text">
            {data.averageScore.toFixed(1)}
            <span className="text-base font-normal text-text-muted ml-1">/10</span>
          </p>
          <p className="text-xs text-text-muted">escala de 0 a 10</p>
        </div>

        {/* NPS Score */}
        <div className="rounded-xl border border-border bg-bg p-5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <TrendingUp className="h-3.5 w-3.5" />
            NPS Score
          </div>
          <p className={`text-3xl font-bold ${npsColor(data.npsScore)}`}>
            {data.npsScore > 0 ? "+" : ""}
            {data.npsScore}
          </p>
          <p className={`text-xs font-medium ${npsColor(data.npsScore)}`}>
            {npsLabel(data.npsScore)}
          </p>
        </div>
      </div>

      {/* NPS distribution gauge */}
      <div className="rounded-xl border border-border bg-bg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-text">Distribuição de Respostas</h3>

        {/* Stacked bar */}
        <div className="flex h-6 w-full overflow-hidden rounded-full gap-0.5">
          {promotersPct > 0 && (
            <div
              className="bg-emerald-500 flex items-center justify-center text-[10px] font-semibold text-white transition-all"
              style={{ width: `${promotersPct}%` }}
              title={`Promotores: ${promotersPct}%`}
            >
              {promotersPct >= 8 ? `${promotersPct}%` : ""}
            </div>
          )}
          {passivesPct > 0 && (
            <div
              className="bg-amber-400 flex items-center justify-center text-[10px] font-semibold text-white transition-all"
              style={{ width: `${passivesPct}%` }}
              title={`Passivos: ${passivesPct}%`}
            >
              {passivesPct >= 8 ? `${passivesPct}%` : ""}
            </div>
          )}
          {detractorsPct > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-[10px] font-semibold text-white transition-all"
              style={{ width: `${detractorsPct}%` }}
              title={`Detratores: ${detractorsPct}%`}
            >
              {detractorsPct >= 8 ? `${detractorsPct}%` : ""}
            </div>
          )}
          {/* If all zero, show a placeholder */}
          {promotersPct === 0 && passivesPct === 0 && detractorsPct === 0 && (
            <div className="flex-1 bg-bg-muted rounded-full" />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs text-text-muted">
              Promotores (9–10){" "}
              <span className="font-semibold text-text">
                {data.promoters} ({promotersPct}%)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-xs text-text-muted">
              Passivos (7–8){" "}
              <span className="font-semibold text-text">
                {data.passives} ({passivesPct}%)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-xs text-text-muted">
              Detratores (0–6){" "}
              <span className="font-semibold text-text">
                {data.detractors} ({detractorsPct}%)
              </span>
            </span>
          </div>
        </div>

        {/* Formula note */}
        <p className="text-[11px] text-text-disabled">
          NPS = % Promotores − % Detratores · Escala: −100 a +100
        </p>
      </div>

      {/* Comments list */}
      <div className="rounded-xl border border-border bg-bg p-5 space-y-1">
        <div className="flex items-center gap-1.5 mb-4">
          <MessageSquare className="h-4 w-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text">Comentários recentes</h3>
          <span className="ml-auto text-xs text-text-muted">
            {data.comments.filter((c) => c.comment).length} com comentário
          </span>
        </div>

        {data.comments.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">Nenhum comentário ainda.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto divide-y divide-border pr-1 space-y-0">
            {data.comments.map((c, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center h-5 min-w-[1.5rem] px-1.5 rounded-full text-[11px] font-bold ${scoreBadgeClass(c.score)}`}
                  >
                    {c.score}
                  </span>
                  <span className="text-[11px] text-text-disabled">{timeAgo(c.createdAt)}</span>
                </div>
                {c.comment ? (
                  <p className="text-sm text-text leading-relaxed">{c.comment}</p>
                ) : (
                  <p className="text-xs text-text-disabled italic">Sem comentário</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
