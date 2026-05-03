import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { DarkInput } from '@/components/ui/dark-input'
import * as authService from '@/services/auth'
import koraIconApp from '@/assets/kora-events-mobile.png'

const schema = z.object({
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    await authService.resetPassword({ token, newPassword: data.newPassword })
    toast.success('Senha redefinida com sucesso!')
    navigate('/login')
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: '#0D0B18',
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 80% 20%, #3B0764 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 20% 80%, #4C1D95 0%, transparent 55%)',
      }}
    >
      <div
        className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full border border-white/5 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 80px rgba(139,92,246,0.06)' }}
      />
      <div
        className="fixed bottom-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full border border-white/5 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 60px rgba(124,58,237,0.08)' }}
      />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl p-8 space-y-7"
        style={{
          background: 'rgba(18,15,30,0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.05)',
        }}
      >
        <div className="flex justify-center">
          <img src={koraIconApp} alt="Kora Events" className="h-12 w-12 rounded-2xl" />
        </div>

        <div className="text-center space-y-1">
          <h1
            className="text-xl font-semibold text-white/90"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Nova senha
          </h1>
          <p className="text-sm text-white/40">Escolha uma senha segura para sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <DarkInput
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
          >
            {isSubmitting ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>Redefinir senha <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
