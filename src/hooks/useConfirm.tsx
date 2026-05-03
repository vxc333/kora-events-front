import { useState, useRef, useCallback } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
}

const ICONS = {
  danger: Trash2,
  warning: AlertTriangle,
  default: AlertTriangle,
}

const ICON_COLORS = {
  danger: 'text-danger bg-danger/8',
  warning: 'text-warning bg-warning/8',
  default: 'text-brand bg-brand/8',
}

export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ title: '' })
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setOptions(opts)
      setOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true)
    resolveRef.current = null
    setOpen(false)
  }, [])

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false)
    resolveRef.current = null
    setOpen(false)
  }, [])

  const variant = options.variant ?? 'default'
  const Icon = ICONS[variant]
  const iconStyle = ICON_COLORS[variant]

  const ConfirmDialogNode = (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel() }}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconStyle)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1 pt-0.5 min-w-0">
              <DialogTitle
                className="text-[15px] font-semibold text-text leading-snug"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {options.title}
              </DialogTitle>
              {options.description && (
                <DialogDescription className="text-[13px] text-text-muted leading-relaxed">
                  {options.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Divider */}
        <div className="h-px bg-border mx-6" />

        {/* Footer */}
        <DialogFooter className="px-6 py-4 flex-row justify-end gap-2.5 sm:space-x-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCancel}
            className="min-w-[72px]"
          >
            {options.cancelLabel ?? 'Cancelar'}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            className="min-w-[72px]"
          >
            {options.confirmLabel ?? 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirm, ConfirmDialogNode }
}
