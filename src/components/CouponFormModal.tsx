import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Coupon, CreateCouponInput } from '@/types/coupons'

const schema = z.object({
  code: z.string().min(1, 'Código obrigatório').transform((v) => v.toUpperCase()),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().min(0.01, 'Valor inválido'),
  maxUses: z
    .union([z.literal(''), z.coerce.number().int().min(1)])
    .transform((v) => (v === '' ? undefined : (v as number)))
    .optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = {
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  maxUses?: number
  expiresAt?: string
  isActive: boolean
}

interface CouponFormModalProps {
  open: boolean
  coupon?: Coupon
  isPending: boolean
  onClose: () => void
  onSubmit: (data: CreateCouponInput) => void
}

export function CouponFormModal({ open, coupon, isPending, onClose, onSubmit }: CouponFormModalProps) {
  const isEdit = !!coupon

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { discountType: 'PERCENTAGE', isActive: true },
  })

  useEffect(() => {
    if (coupon) {
      reset({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses ?? undefined,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
        isActive: coupon.isActive,
      })
    } else {
      reset({ discountType: 'PERCENTAGE', isActive: true })
    }
  }, [coupon, reset])

  if (!open) return null

  const discountType = watch('discountType')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg border border-border bg-bg p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-text">
          {isEdit ? 'Editar cupom' : 'Novo cupom'}
        </h2>

        <form onSubmit={handleSubmit((v) => onSubmit({ ...v }))} className="space-y-4">
          <Input
            label="Código"
            placeholder="EX: KORA10"
            error={errors.code?.message}
            disabled={isEdit}
            {...register('code')}
          />

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-text">Tipo de desconto</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input type="radio" value="PERCENTAGE" {...register('discountType')} className="accent-brand" />
                Porcentagem
              </label>
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input type="radio" value="FIXED" {...register('discountType')} className="accent-brand" />
                Valor fixo
              </label>
            </div>
          </div>

          <Input
            label={discountType === 'PERCENTAGE' ? 'Desconto (%)' : 'Desconto (R$)'}
            type="number"
            min={0}
            step={0.01}
            error={errors.discountValue?.message}
            {...register('discountValue')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Limite de usos"
              type="number"
              min={1}
              placeholder="Ilimitado"
              error={errors.maxUses?.message}
              {...register('maxUses')}
            />
            <Input
              label="Expira em"
              type="date"
              error={errors.expiresAt?.message}
              {...register('expiresAt')}
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="couponIsActive" {...register('isActive')} className="h-4 w-4 accent-brand" />
            <label htmlFor="couponIsActive" className="text-sm text-text">Ativo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isPending}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
