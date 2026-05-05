import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Pencil, Trash2, Plus, ExternalLink, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BlockEditModal } from '@/components/BlockEditModal'
import { BlockPaletteModal } from '@/components/BlockPaletteModal'
import type { PageBlock, PageSettings, BlockType, BlockData } from '@/types/page-builder'
import { BLOCK_META, DEFAULT_PAGE_SETTINGS } from '@/types/page-builder'
import { randomUUID } from '@/lib/uuid'

const FONT_OPTIONS: { value: PageSettings['titleFont']; label: string; style: string }[] = [
  { value: 'dm-serif', label: 'DM Serif', style: '"DM Serif Display", Georgia, serif' },
  { value: 'inter', label: 'Inter', style: '"Inter", system-ui, sans-serif' },
  { value: 'playfair', label: 'Playfair', style: '"Playfair Display", Georgia, serif' },
]

interface SortableBlockRowProps {
  block: PageBlock
  onEdit: (block: PageBlock) => void
  onToggleVisible: (id: string) => void
  onRemove: (id: string) => void
}

function SortableBlockRow({ block, onEdit, onToggleVisible, onRemove }: SortableBlockRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const meta = BLOCK_META[block.type]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3 shadow-sm"
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab text-text-muted hover:text-text active:cursor-grabbing"
        aria-label="Arrastar"
      >
        <GripVertical size={16} />
      </button>

      <span className="text-lg">{meta.icon}</span>
      <span className="flex-1 text-sm font-medium text-text">{meta.label}</span>

      {!block.visible && (
        <span className="rounded-full bg-[#F3F0FF] px-2 py-0.5 text-xs text-[#7C3AED]">oculto</span>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleVisible(block.id)}
          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
          title={block.visible ? 'Ocultar' : 'Mostrar'}
        >
          {block.visible ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button
          onClick={() => onEdit(block)}
          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text"
          title="Editar"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onRemove(block.id)}
          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-50 hover:text-red-500"
          title="Remover"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

interface PageBuilderTabProps {
  eventId: string
  slug: string
  initialBlocks: PageBlock[] | null
  initialSettings: PageSettings | null
  onSave: (blocks: PageBlock[], settings: PageSettings) => void
  isSaving: boolean
}

export function PageBuilderTab({
  slug,
  initialBlocks,
  initialSettings,
  onSave,
  isSaving,
}: PageBuilderTabProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(
    (initialBlocks ?? []).slice().sort((a, b) => a.order - b.order),
  )
  const [settings, setSettings] = useState<PageSettings>(
    initialSettings ?? DEFAULT_PAGE_SETTINGS,
  )
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null)
  const [showPalette, setShowPalette] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }))
    })
  }

  const handleAddBlock = (type: BlockType) => {
    const meta = BLOCK_META[type]
    const newBlock: PageBlock = {
      id: randomUUID(),
      type,
      order: blocks.length,
      visible: true,
      data: meta.defaultData,
    }
    setBlocks((prev) => [...prev, newBlock])
    setShowPalette(false)
    setEditingBlock(newBlock)
  }

  const handleSaveBlock = (updated: PageBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setEditingBlock(null)
  }

  const handleToggleVisible = (id: string) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)))

  const handleRemove = (id: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })))

  const handleSave = () => onSave(blocks, settings)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">Página do evento</h2>
          <p className="text-xs text-text-muted mt-0.5">Personalize o visual e o conteúdo da landing page pública</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/e/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
          >
            <ExternalLink size={13} />
            Ver prévia
          </a>
          <Button size="sm" onClick={handleSave} loading={isSaving} className="gap-1.5">
            <Save size={13} />
            Salvar página
          </Button>
        </div>
      </div>

      {/* Visual settings */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Visual global</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Background color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text">Cor de fundo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.bgColor}
                onChange={(e) => setSettings((s) => ({ ...s, bgColor: e.target.value }))}
                className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
              />
              <span className="text-xs text-text-muted font-mono">{settings.bgColor}</span>
            </div>
          </div>

          {/* Font */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text">Fonte do título</label>
            <div className="flex gap-1.5 flex-wrap">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSettings((s) => ({ ...s, titleFont: f.value }))}
                  className="rounded-lg border px-3 py-1.5 text-xs transition-all"
                  style={{
                    fontFamily: f.style,
                    borderColor: settings.titleFont === f.value ? '#7C3AED' : undefined,
                    background: settings.titleFont === f.value ? '#F5F3FF' : undefined,
                    color: settings.titleFont === f.value ? '#7C3AED' : undefined,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hero layout */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text">Layout do hero</label>
            <div className="flex gap-1.5">
              {([
                { value: 'banner', label: 'Banner full' },
                { value: 'split', label: 'Split' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSettings((s) => ({ ...s, heroLayout: opt.value }))}
                  className="flex-1 rounded-lg border px-3 py-1.5 text-xs transition-all"
                  style={{
                    borderColor: settings.heroLayout === opt.value ? '#7C3AED' : undefined,
                    background: settings.heroLayout === opt.value ? '#F5F3FF' : undefined,
                    color: settings.heroLayout === opt.value ? '#7C3AED' : undefined,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Blocos de conteúdo {blocks.length > 0 && `(${blocks.length})`}
          </p>
          <Button size="sm" variant="secondary" onClick={() => setShowPalette(true)} className="gap-1.5">
            <Plus size={13} />
            Adicionar bloco
          </Button>
        </div>

        {blocks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
            <p className="text-sm text-text-muted">Nenhum bloco ainda.</p>
            <button
              onClick={() => setShowPalette(true)}
              className="mt-2 text-sm font-medium text-brand hover:underline"
            >
              Adicionar o primeiro bloco
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {blocks.map((block) => (
                  <SortableBlockRow
                    key={block.id}
                    block={block}
                    onEdit={setEditingBlock}
                    onToggleVisible={handleToggleVisible}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      {showPalette && (
        <BlockPaletteModal onSelect={handleAddBlock} onClose={() => setShowPalette(false)} />
      )}
      {editingBlock && (
        <BlockEditModal
          block={editingBlock}
          onSave={handleSaveBlock}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  )
}
