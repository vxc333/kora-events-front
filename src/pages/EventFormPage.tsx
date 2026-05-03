import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PlacesAutocomplete } from '@/components/PlacesAutocomplete'
import { useEvent, useCreateEvent, useUpdateEvent } from '@/hooks/useEvent'
import type { CreateEventInput } from '@/types/events'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().min(1, 'Descrição obrigatória'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  endDate: z.string().min(1, 'Data de término obrigatória'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido (HH:MM)'),
  isOnline: z.boolean(),
  location: z.string().optional(),
  onlineLink: z.string().optional(),
  workloadHours: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().min(0, 'Carga horária inválida').optional(),
  ),
  isPublic: z.boolean(),
  maxParticipants: z.preprocess(
    (v) => (v === '' || (typeof v === 'number' && isNaN(v)) ? undefined : v),
    z.number().int().min(1).optional(),
  ),
})

type FormValues = {
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  isOnline: boolean
  location?: string
  onlineLink?: string
  workloadHours?: number
  isPublic: boolean
  maxParticipants?: number
}

export function EventFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { event, isLoading: isLoadingEvent } = useEvent(id ?? '')
  const { createEvent, isPending: isCreating } = useCreateEvent()
  const { updateEvent, isPending: isUpdating } = useUpdateEvent(id ?? '')

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { isOnline: false, isPublic: true },
  })

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
        isOnline: event.isOnline,
        location: event.location ?? '',
        onlineLink: event.onlineLink ?? '',
        workloadHours: event.workloadHours ?? undefined,
        isPublic: event.isPublic,
        maxParticipants: event.maxParticipants ?? undefined,
      })
    }
  }, [event, reset])

  function onSubmit(values: FormValues) {
    const payload: CreateEventInput = {
      ...values,
      startDate: `${values.startDate}T00:00:00.000Z`,
      endDate: `${values.endDate}T00:00:00.000Z`,
    }
    if (isEdit) {
      updateEvent(payload, {})
    } else {
      createEvent(payload, {})
    }
  }

  const isPending = isCreating || isUpdating
  const backHref = isEdit ? `/events/${id}` : '/dashboard'

  if (isEdit && isLoadingEvent) return null

  return (
    <div className="p-8 max-w-xl space-y-7">
      <Link to={backHref} className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors">
        <ChevronLeft className="h-4 w-4" />
        {isEdit ? 'Voltar ao evento' : 'Meus eventos'}
      </Link>

      <h1
        className="text-3xl text-text"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {isEdit ? 'Editar evento' : 'Novo evento'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Título" error={errors.title?.message} {...register('title')} />
        <Textarea label="Descrição" error={errors.description?.message} {...register('description')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Data de início" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <Input label="Data de término" type="date" error={errors.endDate?.message} {...register('endDate')} />
          <Input label="Horário de início" type="time" error={errors.startTime?.message} {...register('startTime')} />
          <Input label="Horário de término" type="time" error={errors.endTime?.message} {...register('endTime')} />
        </div>

        <div className="space-y-3 rounded-xl border border-border p-4">
          <div className="flex items-center gap-2.5">
            <input type="checkbox" id="isOnline" {...register('isOnline')} className="h-4 w-4 rounded accent-brand cursor-pointer" />
            <label htmlFor="isOnline" className="text-sm font-medium text-text cursor-pointer">Evento online</label>
          </div>
          <div className="flex items-center gap-2.5">
            <input type="checkbox" id="isPublic" {...register('isPublic')} className="h-4 w-4 rounded accent-brand cursor-pointer" />
            <label htmlFor="isPublic" className="text-sm font-medium text-text cursor-pointer">Evento público</label>
          </div>
        </div>

        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <PlacesAutocomplete
              label="Local"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.location?.message}
            />
          )}
        />
        <Input label="Carga horária (h) — opcional" type="number" min={0} placeholder="Ex: 8" error={errors.workloadHours?.message} {...register('workloadHours')} />
        <Input label="Máximo de participantes (opcional)" type="number" min={1} error={errors.maxParticipants?.message} {...register('maxParticipants')} />

        <div className="flex gap-3 pt-2">
          <Link to={backHref}>
            <Button type="button" variant="secondary">Cancelar</Button>
          </Link>
          <Button type="submit" loading={isPending}>Salvar</Button>
        </div>
      </form>
    </div>
  )
}
