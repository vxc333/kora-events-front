import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CreditCard,
  QrCode,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  ExternalLink,
  Search,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getParticipants } from '@/services/participants'
import {
  checkoutPix,
  checkoutBoleto,
  getPaymentStatus,
  refundPayment,
  type Payment,
  type PaymentMethod,
} from '@/services/payments'

interface Props {
  eventId: string
}

type PaymentMethodOption = Extract<PaymentMethod, 'PIX' | 'BOLETO'>

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: 'Aguardando', color: '#f59e0b', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: '#10b981', icon: CheckCircle2 },
  FAILED: { label: 'Falhou', color: '#ef4444', icon: XCircle },
  REFUNDED: { label: 'Estornado', color: '#6b7280', icon: RotateCcw },
  CANCELLED: { label: 'Cancelado', color: '#ef4444', icon: XCircle },
}

function fmt(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function PaymentStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function PixDetails({ payment, onRefund, isRefunding }: {
  payment: Payment
  onRefund: () => void
  isRefunding: boolean
}) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!payment.pixQrCode) return
    navigator.clipboard.writeText(payment.pixQrCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PaymentStatusBadge status={payment.status} />
        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-brand)' }}>
          {fmt(payment.amount)}
        </span>
      </div>

      {payment.pixQrCodeUrl && (
        <div className="flex justify-center">
          <img
            src={payment.pixQrCodeUrl}
            alt="QR Code PIX"
            className="h-48 w-48 rounded-xl border border-border"
            style={{ background: '#fff', padding: 8 }}
          />
        </div>
      )}

      {payment.pixQrCode && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-muted">Código copia-e-cola</p>
          <div
            className="flex items-center gap-2 rounded-lg p-3"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <p className="flex-1 text-xs text-text-muted truncate font-mono">{payment.pixQrCode}</p>
            <button
              onClick={copyCode}
              className="flex-shrink-0 flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
              style={{ color: copied ? '#10b981' : 'var(--color-brand)' }}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {payment.pixExpiresAt && (
        <p className="text-xs text-text-muted">
          Expira em:{' '}
          <span className="font-medium text-text">
            {new Date(payment.pixExpiresAt).toLocaleString('pt-BR')}
          </span>
        </p>
      )}

      {payment.status === 'CONFIRMED' && (
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          loading={isRefunding}
          onClick={onRefund}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Solicitar estorno
        </Button>
      )}
    </div>
  )
}

function BoletoDetails({ payment, onRefund, isRefunding }: {
  payment: Payment
  onRefund: () => void
  isRefunding: boolean
}) {
  const [copied, setCopied] = useState(false)

  function copyBarcode() {
    if (!payment.boletoBarcode) return
    navigator.clipboard.writeText(payment.boletoBarcode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PaymentStatusBadge status={payment.status} />
        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-brand)' }}>
          {fmt(payment.amount)}
        </span>
      </div>

      {payment.boletoBarcode && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-muted">Código de barras</p>
          <div
            className="flex items-center gap-2 rounded-lg p-3"
            style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
          >
            <p className="flex-1 text-xs text-text-muted truncate font-mono">{payment.boletoBarcode}</p>
            <button
              onClick={copyBarcode}
              className="flex-shrink-0 flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
              style={{ color: copied ? '#10b981' : 'var(--color-brand)' }}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {payment.boletoUrl && (
        <a
          href={payment.boletoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-9 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Visualizar boleto
        </a>
      )}

      {payment.boletoExpiresAt && (
        <p className="text-xs text-text-muted">
          Vencimento:{' '}
          <span className="font-medium text-text">
            {new Date(payment.boletoExpiresAt).toLocaleDateString('pt-BR')}
          </span>
        </p>
      )}

      {payment.status === 'CONFIRMED' && (
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          loading={isRefunding}
          onClick={onRefund}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Solicitar estorno
        </Button>
      )}
    </div>
  )
}

interface ActivePayment {
  payment: Payment
  isRefunding: boolean
}

export function EventPaymentsTab({ eventId }: Props) {
  const [search, setSearch] = useState('')
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [method, setMethod] = useState<PaymentMethodOption>('PIX')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [activePayments, setActivePayments] = useState<Record<string, ActivePayment>>({})
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set())

  const { data: paginated, isLoading } = useQuery({
    queryKey: ['participants', eventId, { search, limit: 50 }],
    queryFn: () => getParticipants(eventId, { search: search || undefined, limit: 50 }),
  })

  const participants = paginated?.data ?? []
  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId)

  async function handleCheckout() {
    if (!selectedParticipantId) return
    setIsCheckingOut(true)
    try {
      const payment = method === 'PIX'
        ? await checkoutPix(selectedParticipantId)
        : await checkoutBoleto(selectedParticipantId)

      setActivePayments((prev) => ({
        ...prev,
        [selectedParticipantId]: { payment, isRefunding: false },
      }))

      if (payment.status === 'PENDING') {
        startPolling(selectedParticipantId, payment.id)
      }

      toast.success(`${method === 'PIX' ? 'PIX' : 'Boleto'} gerado com sucesso!`)
    } catch {
      toast.error('Erro ao gerar cobrança')
    } finally {
      setIsCheckingOut(false)
    }
  }

  function startPolling(participantId: string, paymentId: string) {
    if (pollingIds.has(paymentId)) return
    setPollingIds((prev) => new Set(prev).add(paymentId))

    const interval = setInterval(async () => {
      try {
        const updated = await getPaymentStatus(paymentId)
        setActivePayments((prev) => {
          const existing = prev[participantId]
          if (!existing) return prev
          return { ...prev, [participantId]: { ...existing, payment: updated } }
        })
        if (updated.status !== 'PENDING') {
          clearInterval(interval)
          setPollingIds((prev) => {
            const next = new Set(prev)
            next.delete(paymentId)
            return next
          })
          if (updated.status === 'CONFIRMED') {
            toast.success('Pagamento confirmado!')
          }
        }
      } catch {
        clearInterval(interval)
      }
    }, 5000)
  }

  async function handleRefund(participantId: string, paymentId: string) {
    setActivePayments((prev) => ({
      ...prev,
      [participantId]: { ...prev[participantId], isRefunding: true },
    }))
    try {
      const updated = await refundPayment(paymentId)
      setActivePayments((prev) => ({
        ...prev,
        [participantId]: { payment: updated, isRefunding: false },
      }))
      toast.success('Estorno solicitado com sucesso!')
    } catch {
      setActivePayments((prev) => ({
        ...prev,
        [participantId]: { ...prev[participantId], isRefunding: false },
      }))
      toast.error('Erro ao solicitar estorno')
    }
  }

  const activePayment = selectedParticipantId ? activePayments[selectedParticipantId] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-text-muted" />
        <h2 className="text-base font-semibold text-text">Pagamentos</h2>
      </div>

      {/* Info box */}
      <div
        className="flex gap-3 rounded-xl p-4"
        style={{
          background: 'rgba(139,92,246,0.05)',
          border: '1px solid rgba(139,92,246,0.12)',
        }}
      >
        <CreditCard className="h-4 w-4 text-brand/50 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">
          Gere cobranças via <span className="font-semibold text-text">PIX</span> ou{' '}
          <span className="font-semibold text-text">Boleto</span> para participantes que precisam
          pagar presencialmente ou por link. Os QR codes são gerados via Pagar.me.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: participant selector + method */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
        >
          <p className="text-sm font-semibold text-text">Nova cobrança</p>

          {/* Search participants */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Participante</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedParticipantId('')
                }}
                className="w-full h-9 pl-9 pr-3 rounded-lg text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand/40"
                style={{
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            {/* Dropdown results */}
            {search.length > 0 && !selectedParticipantId && (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                  </div>
                ) : participants.length === 0 ? (
                  <p className="p-3 text-sm text-text-muted text-center">Nenhum participante encontrado</p>
                ) : (
                  <ul className="max-h-48 overflow-y-auto">
                    {participants.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-bg-subtle transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedParticipantId(p.id)
                            setSearch(p.name)
                          }}
                        >
                          <p className="text-sm font-medium text-text">{p.name}</p>
                          <p className="text-xs text-text-muted">{p.email}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {selectedParticipant && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)' }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-brand)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{selectedParticipant.name}</p>
                  <p className="text-xs text-text-muted truncate">{selectedParticipant.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Method selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Forma de pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {(['PIX', 'BOLETO'] as PaymentMethodOption[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className="flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  style={
                    method === m
                      ? {
                          background: 'rgba(139,92,246,0.12)',
                          border: '1.5px solid var(--color-brand)',
                          color: 'var(--color-brand)',
                        }
                      : {
                          background: 'var(--color-bg-subtle)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }
                  }
                >
                  {m === 'PIX' ? <QrCode className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                  {m === 'PIX' ? 'PIX' : 'Boleto'}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!selectedParticipantId}
            loading={isCheckingOut}
            onClick={handleCheckout}
          >
            {method === 'PIX' ? <QrCode className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            Gerar {method === 'PIX' ? 'PIX' : 'Boleto'}
          </Button>
        </div>

        {/* Right: payment result */}
        <div
          className="rounded-2xl p-5"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
        >
          {!activePayment ? (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(139,92,246,0.08)' }}
              >
                <CreditCard className="h-5 w-5 text-brand/40" />
              </div>
              <p className="text-sm font-medium text-text">Nenhuma cobrança gerada</p>
              <p className="text-xs text-text-muted mt-1">
                Selecione um participante e gere uma cobrança.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text">Cobrança gerada</p>
                {activePayment.payment.status === 'PENDING' && pollingIds.has(activePayment.payment.id) && (
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Aguardando pagamento…
                  </span>
                )}
              </div>

              {activePayment.payment.method === 'PIX' ? (
                <PixDetails
                  payment={activePayment.payment}
                  isRefunding={activePayment.isRefunding}
                  onRefund={() => handleRefund(selectedParticipantId, activePayment.payment.id)}
                />
              ) : (
                <BoletoDetails
                  payment={activePayment.payment}
                  isRefunding={activePayment.isRefunding}
                  onRefund={() => handleRefund(selectedParticipantId, activePayment.payment.id)}
                />
              )}

              <p className="text-[10px] text-text-disabled text-right font-mono">
                ID: {activePayment.payment.id}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
