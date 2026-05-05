import { X } from 'lucide-react'
import type { BlockType } from '@/types/page-builder'
import { BLOCK_META } from '@/types/page-builder'

interface Props {
  onSelect: (type: BlockType) => void
  onClose: () => void
}

export function BlockPaletteModal({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-bg shadow-xl border border-border">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-text">Adicionar bloco</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-surface hover:text-text">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {(Object.keys(BLOCK_META) as BlockType[]).map((type) => {
            const meta = BLOCK_META[type]
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-all hover:border-brand hover:bg-[#F5F3FF]"
              >
                <span className="text-2xl">{meta.icon}</span>
                <span className="text-xs font-medium text-text leading-tight">{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
