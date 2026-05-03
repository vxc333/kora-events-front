import { useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { CheckCircle2, Calendar, Mail, User, ArrowLeft, Share2, Award } from 'lucide-react'
import { usePublicEvent } from '@/hooks/usePublicEvent'
import type { RegisterResult } from '@/services/public'
import { api } from '@/lib/api'

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada',
  PENDING: 'Pendente de aprovação',
  WAITLISTED: 'Lista de espera',
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export function ConfirmationPage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const registration = (location.state as { registration?: RegisterResult } | null)?.registration
  const { event } = usePublicEvent(slug ?? '')

  const primaryColor = event?.primaryColor ?? '#5B21B6'
  const rgb = hexToRgb(primaryColor)

  const isCertificateEligible =
    registration != null &&
    event != null &&
    ((registration.checkedInAt != null && new Date(event.endDate) < new Date()) ||
      registration.certificateReleased === true)

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadCertificate = async () => {
    if (!registration?.qrToken) return
    setIsDownloading(true)
    try {
      const res = await api.get(`/certificates/by-token/${registration.qrToken}`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'certificado.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail — button stays enabled for retry
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title ?? 'Evento',
        url: window.location.origin + `/e/${slug}`,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.origin + `/e/${slug}`)
    }
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-[#FDFCFF] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-[#6A6680]">Nenhuma inscrição encontrada.</p>
          <Link
            to={`/e/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao evento
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCFF] flex flex-col">
      {/* Topo colorido */}
      <div
        className="w-full py-16 px-4 flex flex-col items-center gap-6 text-center"
        style={{ background: `linear-gradient(135deg, rgba(${rgb}, 0.08) 0%, rgba(${rgb}, 0.04) 100%)` }}
      >
        {/* Ícone de sucesso */}
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: `rgba(${rgb}, 0.12)` }}
        >
          <CheckCircle2 className="h-12 w-12" style={{ color: primaryColor }} />
          {/* Rings de pulso */}
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: primaryColor }}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-[#19162A]" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
            Inscrição realizada!
          </h1>
          <p className="text-[#6A6680] mt-2 text-base max-w-md">
            {registration.status === 'PENDING'
              ? 'Sua solicitação foi recebida e aguarda aprovação do organizador.'
              : 'Você está inscrito. Nos vemos em breve!'}
          </p>
        </div>

        {/* Badge de status */}
        <span
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{ background: `rgba(${rgb}, 0.12)`, color: primaryColor }}
        >
          <CheckCircle2 className="h-4 w-4" />
          {STATUS_LABELS[registration.status] ?? registration.status}
        </span>
      </div>

      {/* Card de detalhes */}
      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-md space-y-5">
          {/* Detalhes da inscrição */}
          <div className="rounded-2xl border border-[#E4E0F0] bg-white p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#6A6680] uppercase tracking-wider">Detalhes da inscrição</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `rgba(${rgb}, 0.10)` }}>
                  <User className="h-4 w-4" style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="text-xs text-[#6A6680]">Nome</p>
                  <p className="text-sm font-medium text-[#19162A]">{registration.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `rgba(${rgb}, 0.10)` }}>
                  <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="text-xs text-[#6A6680]">Email</p>
                  <p className="text-sm font-medium text-[#19162A]">{registration.email}</p>
                </div>
              </div>

              {event && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `rgba(${rgb}, 0.10)` }}>
                    <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-xs text-[#6A6680]">Evento</p>
                    <p className="text-sm font-medium text-[#19162A]">{event.title}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleShare}
              className="w-full h-11 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: primaryColor }}
            >
              <Share2 className="h-4 w-4" />
              Compartilhar evento
            </button>
            {isCertificateEligible && (
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className="w-full h-11 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: primaryColor }}
              >
                <Award className="h-4 w-4" />
                {isDownloading ? 'Gerando...' : 'Baixar certificado'}
              </button>
            )}
            <Link
              to={`/e/${slug}`}
              className="w-full h-11 rounded-xl font-medium border border-[#E4E0F0] text-[#19162A] hover:bg-[#F7F5FB] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao evento
            </Link>
          </div>

          <p className="text-center text-xs text-[#B0ACBF] pb-4">
            Guarde este email de confirmação — ele pode ser necessário no dia do evento.
          </p>
        </div>
      </div>

      <footer className="py-6 border-t border-[#E4E0F0]">
        <p className="text-center text-xs text-[#B0ACBF]">
          Powered by <span className="font-semibold" style={{ color: primaryColor }}>Kora Events</span>
        </p>
      </footer>
    </div>
  )
}
