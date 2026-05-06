import { useState, useMemo } from 'react'
import { TrendingUp, Receipt, ArrowDownToLine, Download, CircleDollarSign } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import type { ExtratoEvento } from '@/services/financeiro'

// ── Helpers ────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  ONGOING: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' },
  PUBLISHED: { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa' },
  ONGOING: { bg: 'rgba(16,185,129,0.1)', text: '#34d399' },
  FINISHED: { bg: 'rgba(96,165,250,0.1)', text: '#60a5fa' },
  CANCELLED: { bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
}

const PERIOD_OPTIONS = [
  { label: 'Tudo', months: 0 },
  { label: 'Este mês', months: 1 },
  { label: '3 meses', months: 3 },
  { label: '6 meses', months: 6 },
  { label: 'Este ano', months: 12 },
]

// ── KPI Card ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accent: string
  glow: string
  loading?: boolean
}

function KpiCard({ label, value, icon, accent, glow, loading }: KpiCardProps) {
  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl p-6 overflow-hidden"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        minHeight: 148,
      }}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-30"
        style={{ background: glow }}
      />

      {/* Icon */}
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>

      {/* Value */}
      <div className="relative mt-4">
        {loading ? (
          <Skeleton className="h-8 w-36 rounded-md" />
        ) : (
          <p
            className="text-3xl font-semibold tracking-tight text-text"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {fmt(value)}
          </p>
        )}
        <p className="mt-1.5 text-xs font-medium text-text-muted uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  )
}

// ── Table Row ──────────────────────────────────────────────────────────

function ExtratoRow({ row, index }: { row: ExtratoEvento; index: number }) {
  const statusStyle = STATUS_COLORS[row.eventStatus] ?? STATUS_COLORS.DRAFT
  const even = index % 2 === 0

  return (
    <tr
      className="group transition-colors"
      style={{
        background: even ? 'transparent' : 'rgba(139,92,246,0.025)',
      }}
    >
      <td className="py-3.5 pl-6 pr-4">
        <p className="text-sm font-medium text-text leading-snug line-clamp-1">
          {row.eventTitle}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          {fmtDate(row.eventDate)}
        </p>
      </td>
      <td className="py-3.5 px-4">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ background: statusStyle.bg, color: statusStyle.text }}
        >
          {STATUS_LABELS[row.eventStatus] ?? row.eventStatus}
        </span>
      </td>
      <td
        className="py-3.5 px-4 text-right text-sm tabular-nums text-text-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {row.ingressosVendidos}
      </td>
      <td
        className="py-3.5 px-4 text-right text-sm tabular-nums"
        style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}
      >
        {fmt(row.receitaBruta)}
      </td>
      <td
        className="py-3.5 px-4 text-right text-sm tabular-nums text-text-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {row.taxaPlataforma > 0 ? fmt(row.taxaPlataforma) : '—'}
      </td>
      <td
        className="py-3.5 pl-4 pr-6 text-right text-sm font-semibold tabular-nums"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-brand)' }}
      >
        {fmt(row.valorRepassar)}
      </td>
    </tr>
  )
}

// ── Export ─────────────────────────────────────────────────────────────

function exportCsv(rows: ExtratoEvento[]) {
  const BOM = '﻿'
  const header = 'Evento,Data,Status,Ingressos Vendidos,Receita Bruta,Taxa Plataforma,Valor a Repassar'
  const lines = rows.map((r) =>
    [
      `"${r.eventTitle.replace(/"/g, '""')}"`,
      fmtDate(r.eventDate),
      STATUS_LABELS[r.eventStatus] ?? r.eventStatus,
      r.ingressosVendidos,
      r.receitaBruta.toFixed(2).replace('.', ','),
      r.taxaPlataforma.toFixed(2).replace('.', ','),
      r.valorRepassar.toFixed(2).replace('.', ','),
    ].join(';')
  )
  const csv = BOM + [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `financeiro-kora-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Page ───────────────────────────────────────────────────────────────

export function FinanceiroDashboardPage() {
  const { summary, isLoading } = useFinanceiro()
  const [period, setPeriod] = useState(0)

  const filtered = useMemo(() => {
    if (!summary) return []
    if (period === 0) return summary.extrato
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - period)
    return summary.extrato.filter((e) => new Date(e.eventDate) >= cutoff)
  }, [summary, period])

  const filteredSummary = useMemo(() => ({
    receitaBruta: filtered.reduce((s, e) => s + e.receitaBruta, 0),
    taxaPlataforma: filtered.reduce((s, e) => s + e.taxaPlataforma, 0),
    valorRepassar: filtered.reduce((s, e) => s + e.valorRepassar, 0),
  }), [filtered])

  return (
    <div className="flex flex-col min-h-full">

      {/* Header */}
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
            Financeiro
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Receitas, taxas e repasses por evento
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          disabled={!summary || filtered.length === 0}
          onClick={() => exportCsv(filtered)}
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </header>

      <div className="p-8 space-y-8">

        {/* Period filter */}
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setPeriod(opt.months)}
              className={
                period === opt.months
                  ? 'inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium bg-brand text-white transition-all cursor-pointer'
                  : 'inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium bg-bg border border-border text-text-muted hover:border-brand/40 hover:text-text transition-all cursor-pointer'
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Receita Bruta"
            value={filteredSummary.receitaBruta}
            icon={<TrendingUp className="h-4 w-4" />}
            accent="#10b981"
            glow="#10b981"
            loading={isLoading}
          />
          <KpiCard
            label="Taxa da Plataforma"
            value={filteredSummary.taxaPlataforma}
            icon={<Receipt className="h-4 w-4" />}
            accent="#f59e0b"
            glow="#f59e0b"
            loading={isLoading}
          />
          <KpiCard
            label="Valor a Repassar"
            value={filteredSummary.valorRepassar}
            icon={<ArrowDownToLine className="h-4 w-4" />}
            accent="var(--color-brand)"
            glow="#7c3aed"
            loading={isLoading}
          />
        </div>

        {/* Extrato table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
        >
          {/* Table header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-semibold text-text">
                Extrato por evento
              </h2>
              {!isLoading && (
                <span
                  className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-text-muted"
                  style={{ background: 'var(--color-bg-subtle)' }}
                >
                  {filtered.length}
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(139,92,246,0.08)' }}
              >
                <CircleDollarSign className="h-6 w-6 text-brand/40" />
              </div>
              <p className="text-sm font-medium text-text">Nenhum dado no período</p>
              <p className="text-xs text-text-muted mt-1">Tente ampliar o filtro de período.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {[
                      { label: 'Evento', align: 'left', cls: 'pl-6 pr-4' },
                      { label: 'Status', align: 'left', cls: 'px-4' },
                      { label: 'Ingressos', align: 'right', cls: 'px-4' },
                      { label: 'Receita Bruta', align: 'right', cls: 'px-4' },
                      { label: 'Taxa', align: 'right', cls: 'px-4' },
                      { label: 'A Repassar', align: 'right', cls: 'pl-4 pr-6' },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={`${col.cls} py-3 text-[11px] font-semibold uppercase tracking-widest text-text-muted text-${col.align}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <ExtratoRow key={row.eventId} row={row} index={i} />
                  ))}
                </tbody>
                {/* Totals footer */}
                <tfoot>
                  <tr
                    style={{
                      borderTop: '2px solid var(--color-border)',
                      background: 'rgba(139,92,246,0.04)',
                    }}
                  >
                    <td className="py-4 pl-6 pr-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                        Total
                      </span>
                    </td>
                    <td />
                    <td
                      className="py-4 px-4 text-right text-sm font-bold tabular-nums text-text-muted"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {filtered.reduce((s, e) => s + e.ingressosVendidos, 0)}
                    </td>
                    <td
                      className="py-4 px-4 text-right text-sm font-bold tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}
                    >
                      {fmt(filteredSummary.receitaBruta)}
                    </td>
                    <td
                      className="py-4 px-4 text-right text-sm font-bold tabular-nums text-text-muted"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {fmt(filteredSummary.taxaPlataforma)}
                    </td>
                    <td
                      className="py-4 pl-4 pr-6 text-right text-sm font-bold tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-brand)' }}
                    >
                      {fmt(filteredSummary.valorRepassar)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Fee info box */}
        <div
          className="flex gap-3 rounded-xl p-4"
          style={{
            background: 'rgba(139,92,246,0.05)',
            border: '1px solid rgba(139,92,246,0.12)',
          }}
        >
          <Receipt className="h-4 w-4 text-brand/50 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="font-semibold text-text">Como é calculada a taxa?</span>{' '}
            Para eventos com ingressos pagos, a Kora Events cobra{' '}
            <span className="font-medium text-text">5% da receita bruta</span> + R$ 0,99 por ingresso pago.
            Eventos gratuitos não têm cobrança.
          </p>
        </div>

      </div>
    </div>
  )
}
