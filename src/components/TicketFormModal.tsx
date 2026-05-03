import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { CreateTicketInput, Ticket } from '@/types/tickets'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Preço inválido'),
  quantity: z
    .union([z.literal(''), z.coerce.number().int().min(1)])
    .transform((v) => (v === '' ? undefined : (v as number)))
    .optional(),
  isActive: z.boolean(),
  isHalfPrice: z.boolean(),
})

type FormValues = {
  name: string
  description?: string
  price: number
  quantity?: number
  isActive: boolean
  isHalfPrice: boolean
}

interface TicketFormModalProps {
  open: boolean
  ticket?: Ticket
  isPending: boolean
  onClose: () => void
  onSubmit: (data: CreateTicketInput) => void
}

export function TicketFormModal({ open, ticket, isPending, onClose, onSubmit }: TicketFormModalProps) {
  const isEdit = !!ticket

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { isActive: true, isHalfPrice: false },
  })

  useEffect(() => {
    if (ticket) {
      reset({
        name: ticket.name,
        description: ticket.description ?? '',
        price: ticket.price,
        quantity: ticket.quantity ?? undefined,
        isActive: ticket.isActive,
        isHalfPrice: ticket.isHalfPrice,
      })
    } else {
      reset({ isActive: true, isHalfPrice: false })
    }
  }, [ticket, reset])

  if (!open) return null

  function handleFormSubmit(values: FormValues) {
    onSubmit({ ...values })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-border bg-bg p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-text">
          {isEdit ? 'Editar ingresso' : 'Novo ingresso'}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Nome"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Descrição (opcional)"
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço (R$)"
              type="number"
              min={0}
              step={0.01}
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Quantidade"
              type="number"
              min={1}
              placeholder="Ilimitado"
              error={errors.quantity?.message}
              {...register('quantity')}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4 accent-brand" />
              <label htmlFor="isActive" className="text-sm text-text">Ativo</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isHalfPrice" {...register('isHalfPrice')} className="h-4 w-4 accent-brand" />
              <label htmlFor="isHalfPrice" className="text-sm text-text">Meia-entrada</label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
