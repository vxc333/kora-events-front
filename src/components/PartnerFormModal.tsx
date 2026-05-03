import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { EventPartner, CreatePartnerInput } from '@/types/partners'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  displayOrder: z
    .union([z.literal(''), z.coerce.number().int().min(0)])
    .transform((v) => (v === '' ? 0 : (v as number)))
    .optional(),
})

type FormValues = {
  name: string
  displayOrder?: number
}

interface PartnerFormModalProps {
  open: boolean
  partner?: EventPartner
  isPending: boolean
  onClose: () => void
  onSubmit: (data: CreatePartnerInput) => void
}

export function PartnerFormModal({ open, partner, isPending, onClose, onSubmit }: PartnerFormModalProps) {
  const isEdit = !!partner

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', displayOrder: 0 },
  })

  useEffect(() => {
    if (partner) {
      reset({ name: partner.name, displayOrder: partner.displayOrder })
    } else {
      reset({ name: '', displayOrder: 0 })
    }
  }, [partner, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-border bg-bg p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-text">
          {isEdit ? 'Editar parceiro' : 'Novo parceiro'}
        </h2>

        <form
          onSubmit={handleSubmit((v) => onSubmit({ name: v.name, displayOrder: v.displayOrder }))}
          className="space-y-4"
        >
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Input
            label="Ordem de exibição"
            type="number"
            min={0}
            placeholder="0"
            error={errors.displayOrder?.message}
            {...register('displayOrder')}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isPending}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
