import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    google: typeof google
    initGoogleMaps?: () => void
  }
}

interface Props {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  label?: string
}

let scriptLoaded = false
let scriptLoading = false
const listeners: Array<() => void> = []

function loadGoogleMapsScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  return new Promise((resolve) => {
    listeners.push(resolve)
    if (scriptLoading) return
    scriptLoading = true
    window.initGoogleMaps = () => {
      scriptLoaded = true
      scriptLoading = false
      listeners.splice(0).forEach((fn) => fn())
    }
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
    if (!key) {
      // No API key — resolve immediately, component will fall back to plain input
      scriptLoaded = true
      scriptLoading = false
      listeners.splice(0).forEach((fn) => fn())
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

export function PlacesAutocomplete({ value = '', onChange, placeholder = 'Av. Paulista, 1000 — São Paulo, SP', error, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [ready, setReady] = useState(scriptLoaded)
  const [isFocused, setIsFocused] = useState(false)

  const initAutocomplete = useCallback(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
    if (!key || !inputRef.current || autocompleteRef.current) return
    if (!window.google?.maps?.places) return

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'br' },
      fields: ['formatted_address', 'name'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      const formatted = place.name
        ? place.formatted_address
          ? `${place.name} — ${place.formatted_address}`
          : place.name
        : place.formatted_address ?? ''
      onChange(formatted)
    })

    autocompleteRef.current = ac
  }, [onChange])

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      setReady(true)
      initAutocomplete()
    })
  }, [initAutocomplete])

  useEffect(() => {
    if (ready) initAutocomplete()
  }, [ready, initAutocomplete])

  // Keep input value in sync when form resets (edit mode)
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value
    }
  }, [value])

  const hasApiKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text">{label}</label>
      )}
      <div className={cn(
        'relative flex items-center rounded-lg border bg-surface transition-colors',
        isFocused ? 'border-brand ring-2 ring-brand/20' : 'border-border',
        error && 'border-danger ring-2 ring-danger/20',
      )}>
        <MapPin className={cn('absolute left-3 h-4 w-4 shrink-0 pointer-events-none', isFocused ? 'text-brand' : 'text-text-muted')} />
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false)
            // Update form value on blur (handles manual typing)
            onChange(e.target.value)
          }}
          className="w-full bg-transparent py-2.5 pl-9 pr-10 text-sm text-text placeholder:text-text-muted outline-none"
        />
        {hasApiKey && !ready && (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-text-muted" />
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
