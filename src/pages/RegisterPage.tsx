import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { DarkInput } from '@/components/ui/dark-input'
import { useAuth } from '@/hooks/useAuth'
import koraLogoDark from '@/assets/kora-events-2.png'
import heroImage from '@/assets/hero.png'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { register: registerUser, registerPending, registerError } = useAuth()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const errorMessage = registerError
    ? ((registerError as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao criar conta')
    : null

  const slideAnimation =
    (location.state as { from?: string } | null)?.from === 'login'
      ? 'authSlideFromRight 0.42s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'authPageIn 0.35s ease-out'

  return (
    /* Outer shell — só background, sem animação, evita flash branco */
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0D0B18' }}>
      {/* Gradient mesh fixo — não se move durante a animação */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 90% 30%, #3B0764 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 10% 80%, #4C1D95 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 50% 10%, #1E0A3C 0%, transparent 60%)',
        }}
      />

      {/* Panels — animam juntos enquanto o bg fica parado */}
      <div
        className="flex min-h-screen"
        style={{ animation: slideAnimation }}
      >
        {/* Form panel — esquerda */}
        <div
          className="relative z-20 flex flex-col justify-center w-full lg:w-[460px] flex-shrink-0"
          style={{
            background: 'rgba(18,15,30,0.88)',
            backdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="px-8 lg:px-12 py-12 space-y-8">
            <div>
              <img
                src={koraLogoDark}
                alt="Kora Events"
                className="object-contain object-left mb-8"
                style={{ height: 44, maxWidth: 220 }}
              />
              <h2 className="text-xl font-semibold text-white/90">Criar sua conta</h2>
              <p className="text-sm text-white/40 mt-1">Comece a gerenciar eventos gratuitamente</p>
            </div>

            {errorMessage && (
              <div
                className="flex items-start gap-3 rounded-lg px-4 py-3"
                style={{
                  border: '1px solid rgba(248,113,113,0.3)',
                  background: 'rgba(127,29,29,0.3)',
                  animation: 'errorSlideDown 0.2s ease-out',
                }}
              >
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{errorMessage}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(registerUser as Parameters<typeof handleSubmit>[0])}
              noValidate
              className="space-y-4"
            >
              <DarkInput
                label="Nome"
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                error={errors.name?.message}
                {...register('name')}
              />
              <DarkInput
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <DarkInput
                label="Senha"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password')}
              />

              <button
                type="submit"
                disabled={registerPending}
                className="w-full h-10 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
              >
                {registerPending ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>Criar conta <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <Link
              to="/login"
              state={{ from: 'register' }}
              className="block text-center text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Já tenho conta?{' '}
              <span className="text-violet-400">Entrar</span>
            </Link>
          </div>
        </div>

        {/* Brand panel — direita */}
        <div className="relative z-10 flex-1 hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden">
          <div
            className="absolute top-[-60px] right-[-60px] w-[400px] h-[400px] rounded-full border border-white/5"
            style={{ boxShadow: 'inset 0 0 80px rgba(139,92,246,0.08)' }}
          />
          <div
            className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full border border-white/5"
            style={{ boxShadow: 'inset 0 0 60px rgba(124,58,237,0.1)' }}
          />

          <div className="relative text-center space-y-8 max-w-sm">
            <img
              src={heroImage}
              alt=""
              className="w-64 h-64 object-contain mx-auto"
              style={{
                opacity: 0.85,
                filter: 'drop-shadow(0 0 48px rgba(124,58,237,0.45))',
              }}
            />
            <div className="space-y-3">
              <h2
                className="text-4xl text-white/90 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Comece a criar<br />
                <em className="text-violet-300/90">hoje mesmo.</em>
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Cadastre-se gratuitamente e comece a gerenciar eventos em minutos.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Gestão de ingressos', 'Controle de acesso', 'Relatórios'].map((f) => (
                <span
                  key={f}
                  className="text-xs text-white/50 border border-white/10 rounded-full px-3 py-1"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
