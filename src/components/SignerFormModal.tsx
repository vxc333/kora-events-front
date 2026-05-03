import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { CertificateSigner, CreateSignerInput } from '@/types/signers'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  title: z.string().min(1, 'Cargo obrigatório'),
  displayOrder: z
    .union([z.literal(''), z.coerce.number().int().min(0)])
    .transform((v): number => (v === '' ? 0 : (v as number)))
    .optional(),
})

type FormValues = {
  name: string
  title: string
  displayOrder?: number
}

interface SignerFormModalProps {
  open: boolean
  signer?: CertificateSigner
  isPending: boolean
  onClose: () => void
  onSubmit: (data: CreateSignerInput) => void
}

export function SignerFormModal({ open, signer, isPending, onClose, onSubmit }: SignerFormModalProps) {
  const isEdit = !!signer

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', title: '', displayOrder: 0 },
  })

  useEffect(() => {
    if (signer) {
      reset({ name: signer.name, title: signer.title, displayOrder: signer.displayOrder })
    } else {
      reset({ name: '', title: '', displayOrder: 0 })
    }
  }, [signer, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-border bg-bg p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-text">
          {isEdit ? 'Editar assinante' : 'Novo assinante'}
        </h2>

        <form
          onSubmit={handleSubmit((v) =>
            onSubmit({ name: v.name, title: v.title, displayOrder: v.displayOrder }),
          )}
          className="space-y-4"
        >
          <Input label="Nome" placeholder="Prof. Dr. João Silva" error={errors.name?.message} {...register('name')} />
          <Input label="Cargo" placeholder="Coordenador do Curso" error={errors.title?.message} {...register('title')} />
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
