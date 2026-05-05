import { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertCircle, WifiOff, RefreshCw, Users, Clock, XCircle, Loader2, QrCode, KeyRound } from 'lucide-react'
import { QrScanner } from '@/components/QrScanner'
import { useCheckinQueue } from '@/hooks/useCheckinQueue'
import { useCheckinStats } from '@/hooks/useCheckinStats'
import { useEvent } from '@/hooks/useEvent'
import { performCheckin, performCheckinByCpf } from '@/services/checkin'
import type { CheckinResult } from '@/services/checkin'

type ScanStatus = 'idle' | 'loading' | 'success' | 'already' | 'error' | 'queued'

interface ScanState {
  status: ScanStatus
  result?: CheckinResult
  message?: string
}

const RESULT_CONFIG = {
  success: {
    bg: 'linear-gradient(135deg, #052e16, #14532d)',
    border: '#22c55e40',
    icon: CheckCircle2,
    iconColor: '#4ade80',
    label: 'Check-in realizado',
    glow: '0 0 40px #16a34a40',
  },
  already: {
    bg: 'linear-gradient(135deg, #431407, #7c2d12)',
    border: '#f9731640',
    icon: AlertCircle,
    iconColor: '#fb923c',
    label: 'Já fez check-in',
    glow: '0 0 40px #ea580c30',
  },
  error: {
    bg: 'linear-gradient(135deg, #450a0a, #7f1d1d)',
    border: '#ef444440',
    icon: XCircle,
    iconColor: '#f87171',
    label: 'Token inválido',
    glow: '0 0 40px #dc262640',
  },
  queued: {
    bg: 'linear-gradient(135deg, #1c1917, #292524)',
    border: '#fbbf2440',
    icon: WifiOff,
    iconColor: '#fbbf24',
    label: 'Salvo offline',
    glow: '0 0 40px #d9770630',
  },
  loading: {
    bg: 'linear-gradient(135deg, #0f0d18, #1e1c2c)',
    border: '#7c3aed40',
    icon: Loader2,
    iconColor: '#a78bfa',
    label: 'Verificando...',
    glow: '0 0 40px #7c3aed20',
  },
  idle: null,
} as const

type Mode = 'qr' | 'cpf'

export function CheckinScannerPage() {
  const { eventId = '' } = useParams<{ eventId: string }>()
  const { event, isLoading: eventLoading } = useEvent(eventId)
  const { stats, refetch: refetchStats } = useCheckinStats(eventId)
  const { queueCount, isSyncing, isOnline, addToQueue, sync } = useCheckinQueue()
  const [scan, setScan] = useState<ScanState>({ status: 'idle' })
  const [mode, setMode] = useState<Mode>('qr')
  const [cpfInput, setCpfInput] = useState('')
  const cpfRef = useRef<HTMLInputElement>(null)

  const handleScan = useCallback(async (token: string) => {
    setScan({ status: 'loading' })

    if (!isOnline) {
      await addToQueue(token)
      setScan({ status: 'queued', message: 'Será sincronizado quando a conexão voltar' })
      setTimeout(() => setScan({ status: 'idle' }), 3000)
      return
    }

    try {
      const result = await performCheckin(token)
      setScan({ status: 'success', result })
      refetchStats()
      setTimeout(() => setScan({ status: 'idle' }), 3500)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Já fez check-in'
        setScan({ status: 'already', message: msg })
      } else {
        setScan({ status: 'error', message: 'Token não encontrado' })
      }
      setTimeout(() => setScan({ status: 'idle' }), 3000)
    }
  }, [isOnline, addToQueue, refetchStats])

  const handleCpfCheckin = useCallback(async () => {
    if (!cpfInput || scan.status === 'loading') return
    setScan({ status: 'loading' })
    try {
      const result = await performCheckinByCpf(cpfInput, eventId)
      setScan({ status: 'success', result })
      setCpfInput('')
      refetchStats()
      setTimeout(() => setScan({ status: 'idle' }), 3500)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Já fez check-in'
        setScan({ status: 'already', message: msg })
      } else {
        setScan({ status: 'error', message: 'CPF não encontrado neste evento' })
      }
      setTimeout(() => setScan({ status: 'idle' }), 3000)
    }
  }, [cpfInput, eventId, scan.status, refetchStats])

  const formatCpfInput = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const pct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0

  const config = scan.status !== 'idle' ? RESULT_CONFIG[scan.status] : null
  const IconComponent = config?.icon

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [])

  return (
    <div
      className="relative flex h-dvh flex-col overflow-hidden"
      style={{ background: '#0D0B18', fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Camera — full background, only in QR mode */}
      <div className="absolute inset-0">
        <QrScanner onScan={handleScan} active={mode === 'qr' && scan.status === 'idle'} />
      </div>

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(13,11,24,0.75) 100%)',
        }}
      />

      {/* Top overlay — header */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-4"
        style={{ background: 'linear-gradient(to bottom, rgba(13,11,24,0.95), transparent)' }}
      >
        <Link
          to="/checkin"
          className="flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Eventos
        </Link>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center rounded-full bg-white/8 p-0.5">
            <button
              onClick={() => { setMode('qr'); setScan({ status: 'idle' }) }}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={{
                background: mode === 'qr' ? 'rgba(124,58,237,0.7)' : 'transparent',
                color: mode === 'qr' ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <QrCode size={11} />
              QR
            </button>
            <button
              onClick={() => { setMode('cpf'); setScan({ status: 'idle' }); setTimeout(() => cpfRef.current?.focus(), 100) }}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={{
                background: mode === 'cpf' ? 'rgba(124,58,237,0.7)' : 'transparent',
                color: mode === 'cpf' ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <KeyRound size={11} />
              CPF
            </button>
          </div>

          {queueCount > 0 && (
            <button
              onClick={() => sync()}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-400/25 disabled:opacity-50"
            >
              <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
              {queueCount} offline
            </button>
          )}
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              background: isOnline ? '#16a34a18' : '#dc262618',
              color: isOnline ? '#4ade80' : '#f87171',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: isOnline ? '#4ade80' : '#f87171' }} />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Event name */}
      {!eventLoading && event && (
        <div className="relative z-10 px-4 pb-2">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-violet-400">
            {event.title}
          </p>
        </div>
      )}

      {/* Viewfinder — center overlay */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        {mode === 'qr' ? (
          <div className="relative" style={{ width: 220, height: 220 }}>
            {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
              <svg
                key={corner}
                className="absolute"
                width={36}
                height={36}
                style={{
                  top: corner.startsWith('t') ? 0 : 'auto',
                  bottom: corner.startsWith('b') ? 0 : 'auto',
                  left: corner.endsWith('l') ? 0 : 'auto',
                  right: corner.endsWith('r') ? 0 : 'auto',
                  transform: `rotate(${{ tl: 0, tr: 90, bl: 270, br: 180 }[corner]}deg)`,
                }}
              >
                <path
                  d="M4 32 L4 4 L32 4"
                  fill="none"
                  stroke={scan.status === 'success' ? '#4ade80' : '#7c3aed'}
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.3s' }}
                />
              </svg>
            ))}
            {scan.status === 'idle' && (
              <div
                className="absolute left-3 right-3"
                style={{
                  height: 2,
                  background: 'linear-gradient(to right, transparent, #7c3aed, #a78bfa, #7c3aed, transparent)',
                  boxShadow: '0 0 8px #7c3aed80',
                  animation: 'scanLine 2s ease-in-out infinite',
                }}
              />
            )}
            {scan.status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-violet-400" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-xs px-6 flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              <KeyRound size={22} className="text-violet-400" />
            </div>
            <p className="text-sm text-white/50 text-center">Digite o CPF do participante</p>
            <input
              ref={cpfRef}
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpfInput}
              onChange={(e) => setCpfInput(formatCpfInput(e.target.value))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCpfCheckin() }}
              disabled={scan.status === 'loading'}
              className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-center text-lg font-mono tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 disabled:opacity-50"
            />
            <button
              onClick={handleCpfCheckin}
              disabled={scan.status === 'loading' || cpfInput.replace(/\D/g, '').length < 11}
              className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}
            >
              {scan.status === 'loading' ? (
                <Loader2 size={18} className="animate-spin mx-auto" />
              ) : (
                'Fazer Check-in'
              )}
            </button>
          </div>
        )}

        <style>{`
          @keyframes scanLine {
            0%   { top: 12px; opacity: 0.4; }
            50%  { top: 208px; opacity: 1; }
            100% { top: 12px; opacity: 0.4; }
          }
        `}</style>
      </div>

      {/* Bottom panel */}
      <div
        className="relative z-10 flex flex-col gap-3 px-4 pb-6 pt-4"
        style={{ background: 'linear-gradient(to top, rgba(13,11,24,0.98) 60%, transparent)' }}
      >
        {/* Result card */}
        {config && (
          <div
            className="rounded-2xl border p-4"
            style={{
              background: config.bg,
              borderColor: config.border,
              boxShadow: config.glow,
              animation: 'resultIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div className="flex items-start gap-3">
              {IconComponent && (
                <IconComponent
                  size={22}
                  className={scan.status === 'loading' ? 'animate-spin' : ''}
                  style={{ color: config.iconColor, marginTop: 1, flexShrink: 0 }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.iconColor }}>
                  {config.label}
                </p>
                {scan.result ? (
                  <>
                    <p className="mt-0.5 text-base font-bold text-white">{scan.result.name}</p>
                    <p className="text-xs text-white/50">{scan.result.email}</p>
                    {scan.status === 'success' && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                        <Clock size={10} />
                        {new Date(scan.result.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </>
                ) : scan.message ? (
                  <p className="mt-0.5 text-sm text-white/70">{scan.message}</p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div
          className="rounded-xl border border-white/6 bg-white/3 p-3.5"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-white/40">
              <Users size={12} />
              Progresso
            </span>
            <span className="text-xs font-bold" style={{ color: pct === 100 ? '#4ade80' : '#a78bfa' }}>
              {pct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(to right, #5B21B6, #7C3AED, #A78BFA)',
                boxShadow: '0 0 8px #7c3aed60',
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-white">{stats.checkedIn}</p>
              <p className="text-xs text-emerald-400/80">✓ confirmados</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-white/40">⏳ pendentes</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white/30">total</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/20">
          {mode === 'qr' ? 'Aponte a câmera para o QR code do participante' : 'Pressione Enter ou toque em "Fazer Check-in"'}
        </p>
      </div>

      <style>{`
        @keyframes resultIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
