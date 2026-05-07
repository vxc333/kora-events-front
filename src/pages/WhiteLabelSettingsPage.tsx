import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Settings, Globe, ImageIcon, Palette, Eye, AlertTriangle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  getWhiteLabelConfig,
  updateWhiteLabelConfig,
  type WhiteLabelConfig,
  type UpdateWhiteLabelInput,
} from '@/services/whiteLabelAccount'

// ── Section card ─────────────────────────────────────────────────────────

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(91,33,182,0.08)' }}
        >
          <Icon className="h-4 w-4" style={{ color: '#5B21B6' }} />
        </div>
        <h3 className="text-[14px] font-semibold" style={{ color: '#19162A' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

// ── Field label ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-medium mb-1.5" style={{ color: '#6A6680' }}>
      {children}
    </p>
  )
}

// ── Text input ───────────────────────────────────────────────────────────

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
      style={{
        background: 'rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.10)',
        color: '#19162A',
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = '#7C3AED'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.10)'
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

// ── Color picker row ─────────────────────────────────────────────────────

function ColorPickerRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-9 rounded-lg cursor-pointer border-0 p-0.5"
          style={{
            background: 'transparent',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </div>
      <div className="flex-1">
        <FieldLabel>{label}</FieldLabel>
        <p className="text-[12px] font-mono" style={{ color: '#6A6680' }}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ── WhiteLabelSettingsPage ───────────────────────────────────────────────

export function WhiteLabelSettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isEnterprise = user?.plan === 'ENTERPRISE'

  const { data: config, isLoading } = useQuery<WhiteLabelConfig>({
    queryKey: ['white-label-config'],
    queryFn: getWhiteLabelConfig,
  })

  const [form, setForm] = useState<Required<UpdateWhiteLabelInput>>({
    customDomain: '',
    logoUrl: '',
    primaryColor: '#5B21B6',
    accentColor: '#7C3AED',
    hidePoweredBy: false,
  })

  useEffect(() => {
    if (config) {
      setForm({
        customDomain: config.customDomain ?? '',
        logoUrl: config.logoUrl ?? '',
        primaryColor: config.primaryColor ?? '#5B21B6',
        accentColor: config.accentColor ?? '#7C3AED',
        hidePoweredBy: config.hidePoweredBy,
      })
    }
  }, [config])

  const mutation = useMutation({
    mutationFn: (data: UpdateWhiteLabelInput) => updateWhiteLabelConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['white-label-config'] })
      toast.success('Configurações salvas!')
    },
    onError: () => {
      toast.error('Erro ao salvar. Tente novamente.')
    },
  })

  function handleSave() {
    mutation.mutate({
      customDomain: form.customDomain || undefined,
      logoUrl: form.logoUrl || undefined,
      primaryColor: form.primaryColor,
      accentColor: form.accentColor,
      hidePoweredBy: form.hidePoweredBy,
    })
  }

  function openUpgradeModal() {
    window.dispatchEvent(new CustomEvent('plan-upgrade-required'))
  }

  return (
    <div
      className="min-h-full"
      style={{ background: 'var(--color-bg-subtle)', padding: '40px 40px 80px' }}
    >
      {/* Page header */}
      <div className="max-w-2xl mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(91,33,182,0.10)', border: '1px solid rgba(91,33,182,0.15)' }}
          >
            <Settings className="h-5 w-5" style={{ color: '#5B21B6' }} />
          </div>
          <h1 className="text-[22px] font-bold" style={{ color: '#19162A' }}>
            White-label
          </h1>
        </div>
        <p className="text-[14px] ml-[52px]" style={{ color: '#6A6680' }}>
          Personalize a identidade visual da sua plataforma
        </p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Plan gate banner */}
        {!isEnterprise && (
          <div
            className="flex items-center gap-4 rounded-2xl p-4"
            style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.25)',
            }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
            <div className="flex-1">
              <p className="text-[13px] font-medium" style={{ color: '#92400e' }}>
                Esta funcionalidade está disponível no plano Enterprise.
              </p>
            </div>
            <button
              onClick={openUpgradeModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                color: '#fff',
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              Ver planos
            </button>
          </div>
        )}

        {/* Settings section — always visible but disabled if not Enterprise */}
        <div
          style={{ opacity: isEnterprise ? 1 : 0.5, pointerEvents: isEnterprise ? 'auto' : 'none' }}
          className="space-y-5"
        >
          {/* Identidade visual */}
          <SettingsCard icon={Palette} title="Identidade visual">
            <div className="space-y-5">
              <div className="flex gap-6">
                <ColorPickerRow
                  label="Cor primária"
                  value={form.primaryColor}
                  onChange={(v) => setForm((f) => ({ ...f, primaryColor: v }))}
                  disabled={!isEnterprise || isLoading}
                />
                <ColorPickerRow
                  label="Cor de destaque"
                  value={form.accentColor}
                  onChange={(v) => setForm((f) => ({ ...f, accentColor: v }))}
                  disabled={!isEnterprise || isLoading}
                />
              </div>

              {/* Preview swatch */}
              <div>
                <FieldLabel>Pré-visualização</FieldLabel>
                <div className="flex gap-2 mt-1">
                  <div
                    className="h-8 w-24 rounded-lg"
                    style={{ background: form.primaryColor }}
                    title="Cor primária"
                  />
                  <div
                    className="h-8 w-24 rounded-lg"
                    style={{ background: form.accentColor }}
                    title="Cor de destaque"
                  />
                </div>
              </div>
            </div>
          </SettingsCard>

          {/* Domínio personalizado */}
          <SettingsCard icon={Globe} title="Domínio personalizado">
            <FieldLabel>Domínio</FieldLabel>
            <TextInput
              value={form.customDomain}
              onChange={(v) => setForm((f) => ({ ...f, customDomain: v }))}
              placeholder="eventos.suaempresa.com"
              disabled={!isEnterprise || isLoading}
            />
            <p className="mt-2 text-[11.5px]" style={{ color: '#6A6680' }}>
              Aponte seu domínio para o IP do Kora Events via registro CNAME.
            </p>
          </SettingsCard>

          {/* Logo */}
          <SettingsCard icon={ImageIcon} title="Logo">
            <FieldLabel>URL da logo</FieldLabel>
            <TextInput
              value={form.logoUrl}
              onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))}
              placeholder="https://suaempresa.com/logo.svg"
              disabled={!isEnterprise || isLoading}
            />
          </SettingsCard>

          {/* Powered by */}
          <SettingsCard icon={Eye} title="Powered by">
            <label
              className="flex items-start gap-3 cursor-pointer group"
              style={{ opacity: !isEnterprise ? 0.5 : 1, pointerEvents: !isEnterprise ? 'none' : 'auto' }}
            >
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={form.hidePoweredBy}
                  onChange={(e) => setForm((f) => ({ ...f, hidePoweredBy: e.target.checked }))}
                  disabled={!isEnterprise || isLoading}
                  className="sr-only"
                />
                <div
                  className="h-5 w-5 rounded flex items-center justify-center transition-all"
                  style={{
                    background: form.hidePoweredBy ? '#5B21B6' : 'rgba(0,0,0,0.06)',
                    border: form.hidePoweredBy ? '1px solid #5B21B6' : '1px solid rgba(0,0,0,0.15)',
                  }}
                  onClick={() => {
                    if (isEnterprise && !isLoading) {
                      setForm((f) => ({ ...f, hidePoweredBy: !f.hidePoweredBy }))
                    }
                  }}
                >
                  {form.hidePoweredBy && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#19162A' }}>
                  Remover o rodapé "Powered by Kora Events"
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: '#6A6680' }}>
                  Exibe sua marca sem menção ao Kora Events nas páginas públicas.
                </p>
              </div>
            </label>
          </SettingsCard>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={!isEnterprise || mutation.isPending || isLoading}
            className="px-6 py-2.5 text-[13.5px] font-semibold rounded-xl cursor-pointer"
            style={{
              background: isEnterprise ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : undefined,
              boxShadow: isEnterprise ? '0 4px 14px rgba(109,40,217,0.35)' : undefined,
            }}
          >
            {mutation.isPending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}
