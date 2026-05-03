import * as React from 'react'
import { AlertCircle } from 'lucide-react'

interface DarkInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const DarkInput = React.forwardRef<HTMLInputElement, DarkInputProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="text-xs font-medium text-white/50 uppercase tracking-wide">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className="w-full h-10 rounded-lg px-3 text-sm text-white/90 placeholder:text-white/20 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: error ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(255,255,255,0.08)',
          }}
          onFocus={(e) => { e.currentTarget.style.border = '1px solid rgba(139,92,246,0.6)' }}
          onBlur={(e) => { e.currentTarget.style.border = error ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(255,255,255,0.08)' }}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    )
  }
)
DarkInput.displayName = 'DarkInput'

export { DarkInput }
export type { DarkInputProps }
