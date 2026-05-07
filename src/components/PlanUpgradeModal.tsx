import { useState, useEffect } from 'react'
import { X, Zap, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ── Plan card ────────────────────────────────────────────────────────────

interface PlanCardProps {
  name: string
  tagline: string
  features: string[]
  variant: 'pro' | 'enterprise'
}

function PlanCard({ name, tagline, features, variant }: PlanCardProps) {
  const isPro = variant === 'pro'

  return (
    <div
      className="flex-1 rounded-xl p-5 flex flex-col gap-3"
      style={{
        background: isPro
          ? 'rgba(109,40,217,0.14)'
          : 'rgba(217,119,6,0.10)',
        border: isPro
          ? '1px solid rgba(139,92,246,0.30)'
          : '1px solid rgba(245,158,11,0.30)',
      }}
    >
      {/* Badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
          style={
            isPro
              ? { background: 'rgba(139,92,246,0.25)', color: '#a78bfa' }
              : {
                  background: 'linear-gradient(90deg, rgba(217,119,6,0.3) 0%, rgba(245,158,11,0.3) 100%)',
                  color: '#fbbf24',
                }
          }
        >
          {name}
        </span>
      </div>

      <p className="text-[12px] leading-snug" style={{ color: 'rgba(255,255,255,0.50)' }}>
        {tagline}
      </p>

      <ul className="space-y-2 mt-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[12.5px]" style={{ color: 'rgba(255,255,255,0.72)' }}>
            <Check
              className="h-3.5 w-3.5 flex-shrink-0 mt-[1px]"
              style={{ color: isPro ? '#a78bfa' : '#fbbf24' }}
            />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── PlanUpgradeModal ─────────────────────────────────────────────────────

export function PlanUpgradeModal() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('plan-upgrade-required', handler)
    return () => window.removeEventListener('plan-upgrade-required', handler)
  }, [])

  if (!open) return null

  const planLabel =
    user?.plan === 'ENTERPRISE'
      ? 'Enterprise'
      : user?.plan === 'PRO'
      ? 'Plano Pro'
      : 'Plano Free'

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: '#0B0912',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Violet glow top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48"
          style={{
            background:
              'radial-gradient(ellipse 100% 70% at 50% -10%, rgba(124,58,237,0.45) 0%, transparent 100%)',
          }}
        />

        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 pt-8 pb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}
            >
              <Zap className="h-4.5 w-4.5" style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-white leading-tight">
                Faça upgrade do seu plano
              </h2>
            </div>
          </div>

          {/* Current plan */}
          <p className="text-[12px] mb-5 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Você está no
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}
            >
              {planLabel}
            </span>
          </p>

          {/* Plan columns */}
          <div className="flex gap-3 mb-6">
            <PlanCard
              variant="pro"
              name="Pro"
              tagline="Para organizadores que querem crescer"
              features={[
                'Ingressos pagos',
                'Cupons ilimitados',
                'Relatórios avançados',
              ]}
            />
            <PlanCard
              variant="enterprise"
              name="Enterprise"
              tagline="Para marcas e grandes operações"
              features={[
                'White-label completo',
                'Domínio próprio',
                'Múltiplos organizadores',
              ]}
            />
          </div>

          {/* CTA */}
          <a
            href="mailto:contato@koraevents.com"
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              boxShadow: '0 4px 16px rgba(109,40,217,0.45)',
            }}
          >
            <Zap className="h-4 w-4" style={{ color: '#fbbf24' }} />
            Falar com nossa equipe
          </a>

          <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Resposta em até 24 horas · sem compromisso
          </p>
        </div>
      </div>
    </div>
  )
}
