import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Participant, ParticipantStatus } from '@/types/participants'
import type { Ticket } from '@/types/tickets'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().optional(),
  ticketId: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
})

export type ParticipantFormOutput = {
  name: string
  email: string
  cpf?: string
  ticketId?: string
  status?: ParticipantStatus
}

interface ParticipantFormModalProps {
  open: boolean
  participant?: Participant
  tickets: Ticket[]
  isPending: boolean
  onClose: () => void
  onSubmit: (data: ParticipantFormOutput) => void
}

const STATUS_LABELS: Record<ParticipantStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
}

export function ParticipantFormModal({
  open,
  participant,
  tickets,
  isPending,
  onClose,
  onSubmit,
}: ParticipantFormModalProps) {
  const isEdit = !!participant

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ParticipantFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'PENDING' },
  })

  useEffect(() => {
    if (participant) {
      reset({
        name: participant.name,
        email: participant.email,
        cpf: participant.cpf ?? '',
        ticketId: participant.ticketId ?? '',
        status: participant.status,
      })
    } else {
      reset({ name: '', email: '', cpf: '', ticketId: '', status: 'PENDING' })
    }
  }, [participant, reset])

  if (!open) return null

  function handleFormSubmit(values: ParticipantFormOutput) {
    onSubmit({
      name: values.name,
      email: values.email,
      cpf: values.cpf || undefined,
      ticketId: values.ticketId || undefined,
      status: isEdit ? values.status : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-border bg-bg p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-text">
          {isEdit ? 'Editar participante' : 'Novo participante'}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Input
            label="E-mail"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="CPF (opcional)"
            placeholder="000.000.000-00"
            error={errors.cpf?.message}
            {...register('cpf')}
          />

          {tickets.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Ingresso (opcional)</label>
              <select
                {...register('ticketId')}
                className="h-9 w-full rounded-md border border-border bg-bg px-3 py-1 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              >
                <option value="">Nenhum</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {isEdit && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Status</label>
              <select
                {...register('status')}
                className="h-9 w-full rounded-md border border-border bg-bg px-3 py-1 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
              >
                {(['PENDING', 'CONFIRMED', 'CANCELLED'] as ParticipantStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isPending}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
