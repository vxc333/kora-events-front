import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  PageBlock,
  AgendaData, AgendaItem,
  SpeakersData, SpeakerItem,
  FaqData, FaqItem,
  GalleryData, GalleryImage,
  SponsorsData, SponsorItem,
  TextData,
  VideoData,
  CountdownData,
} from '@/types/page-builder'
import { BLOCK_META } from '@/types/page-builder'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1'
const textareaCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 resize-y min-h-[80px]'

// ── Agenda ───────────────────────────────────────────────────────────────────
function AgendaForm({ data, onChange }: { data: AgendaData; onChange: (d: AgendaData) => void }) {
  const updateItem = (i: number, patch: Partial<AgendaItem>) =>
    onChange({ ...data, items: data.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
  const addItem = () => onChange({ ...data, items: [...data.items, { time: '', title: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Título da seção">
        <input className={inputCls} value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      <div className="space-y-2">
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start rounded-lg border border-border bg-surface p-3">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex gap-2">
                <input className={inputCls + ' w-24'} placeholder="09:00" value={item.time} onChange={(e) => updateItem(i, { time: e.target.value })} />
                <input className={inputCls + ' flex-1'} placeholder="Título da atividade" value={item.title} onChange={(e) => updateItem(i, { title: e.target.value })} />
              </div>
              <input className={inputCls} placeholder="Descrição (opcional)" value={item.description ?? ''} onChange={(e) => updateItem(i, { description: e.target.value })} />
            </div>
            <button onClick={() => removeItem(i)} className="mt-0.5 rounded p-1 text-text-muted hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
          <Plus size={13} /> Adicionar item
        </button>
      </div>
    </div>
  )
}

// ── Speakers ──────────────────────────────────────────────────────────────────
function SpeakersForm({ data, onChange }: { data: SpeakersData; onChange: (d: SpeakersData) => void }) {
  const updateItem = (i: number, patch: Partial<SpeakerItem>) =>
    onChange({ ...data, items: data.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
  const addItem = () => onChange({ ...data, items: [...data.items, { name: '', role: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Título da seção">
        <input className={inputCls} value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      {data.items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Palestrante {i + 1}</span>
            <button onClick={() => removeItem(i)} className="rounded p-1 text-text-muted hover:text-red-500"><Trash2 size={13} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Nome" value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
            <input className={inputCls} placeholder="Cargo / Empresa" value={item.role} onChange={(e) => updateItem(i, { role: e.target.value })} />
          </div>
          <input className={inputCls} placeholder="URL da foto (opcional)" value={item.photoUrl ?? ''} onChange={(e) => updateItem(i, { photoUrl: e.target.value })} />
          <textarea className={textareaCls} placeholder="Bio (opcional)" value={item.bio ?? ''} onChange={(e) => updateItem(i, { bio: e.target.value })} />
        </div>
      ))}
      <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
        <Plus size={13} /> Adicionar palestrante
      </button>
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FaqForm({ data, onChange }: { data: FaqData; onChange: (d: FaqData) => void }) {
  const updateItem = (i: number, patch: Partial<FaqItem>) =>
    onChange({ ...data, items: data.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
  const addItem = () => onChange({ ...data, items: [...data.items, { question: '', answer: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Título da seção">
        <input className={inputCls} value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      {data.items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-text-muted">Pergunta {i + 1}</span>
            <button onClick={() => removeItem(i)} className="rounded p-1 text-text-muted hover:text-red-500"><Trash2 size={13} /></button>
          </div>
          <input className={inputCls} placeholder="Pergunta" value={item.question} onChange={(e) => updateItem(i, { question: e.target.value })} />
          <textarea className={textareaCls} placeholder="Resposta" value={item.answer} onChange={(e) => updateItem(i, { answer: e.target.value })} />
        </div>
      ))}
      <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
        <Plus size={13} /> Adicionar pergunta
      </button>
    </div>
  )
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function GalleryForm({ data, onChange }: { data: GalleryData; onChange: (d: GalleryData) => void }) {
  const updateImage = (i: number, patch: Partial<GalleryImage>) =>
    onChange({ ...data, images: data.images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)) })
  const addImage = () => onChange({ ...data, images: [...data.images, { url: '' }] })
  const removeImage = (i: number) => onChange({ ...data, images: data.images.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Título da seção">
        <input className={inputCls} value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      {data.images.map((img, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="flex-1 space-y-1.5">
            <input className={inputCls} placeholder="URL da imagem" value={img.url} onChange={(e) => updateImage(i, { url: e.target.value })} />
            <input className={inputCls} placeholder="Legenda (opcional)" value={img.caption ?? ''} onChange={(e) => updateImage(i, { caption: e.target.value })} />
          </div>
          {img.url && <img src={img.url} alt="" className="h-14 w-14 rounded-lg object-cover border border-border flex-shrink-0" />}
          <button onClick={() => removeImage(i)} className="rounded p-1 text-text-muted hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={addImage} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
        <Plus size={13} /> Adicionar imagem
      </button>
    </div>
  )
}

// ── Sponsors ──────────────────────────────────────────────────────────────────
function SponsorsForm({ data, onChange }: { data: SponsorsData; onChange: (d: SponsorsData) => void }) {
  const updateItem = (i: number, patch: Partial<SponsorItem>) =>
    onChange({ ...data, items: data.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
  const addItem = () => onChange({ ...data, items: [...data.items, { name: '', logoUrl: '' }] })
  const removeItem = (i: number) => onChange({ ...data, items: data.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <Field label="Título da seção">
        <input className={inputCls} value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      {data.items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="flex-1 space-y-1.5">
            <input className={inputCls} placeholder="Nome do patrocinador" value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
            <input className={inputCls} placeholder="URL do logo" value={item.logoUrl} onChange={(e) => updateItem(i, { logoUrl: e.target.value })} />
            <input className={inputCls} placeholder="Website (opcional)" value={item.website ?? ''} onChange={(e) => updateItem(i, { website: e.target.value })} />
          </div>
          {item.logoUrl && <img src={item.logoUrl} alt={item.name} className="h-12 w-20 rounded-lg object-contain border border-border flex-shrink-0 bg-white p-1" />}
          <button onClick={() => removeItem(i)} className="rounded p-1 text-text-muted hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">
        <Plus size={13} /> Adicionar patrocinador
      </button>
    </div>
  )
}

// ── Text ──────────────────────────────────────────────────────────────────────
function TextForm({ data, onChange }: { data: TextData; onChange: (d: TextData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Título (opcional)">
        <input className={inputCls} placeholder="Deixe vazio para omitir" value={data.title ?? ''} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      <Field label="Conteúdo">
        <textarea className={textareaCls + ' min-h-[160px]'} value={data.content} onChange={(e) => onChange({ ...data, content: e.target.value })} />
      </Field>
    </div>
  )
}

// ── Video ─────────────────────────────────────────────────────────────────────
function VideoForm({ data, onChange }: { data: VideoData; onChange: (d: VideoData) => void }) {
  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    const vimeo = url.match(/vimeo\.com\/(\d+)/)
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
    return null
  }
  const embedUrl = getEmbedUrl(data.url)

  return (
    <div className="space-y-4">
      <Field label="Título (opcional)">
        <input className={inputCls} placeholder="Deixe vazio para omitir" value={data.title ?? ''} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      <Field label="URL do vídeo (YouTube ou Vimeo)">
        <input className={inputCls} placeholder="https://youtube.com/watch?v=..." value={data.url} onChange={(e) => onChange({ ...data, url: e.target.value })} />
      </Field>
      {embedUrl && (
        <div className="rounded-xl overflow-hidden border border-border aspect-video">
          <iframe src={embedUrl} className="h-full w-full" allowFullScreen title="preview" />
        </div>
      )}
    </div>
  )
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function CountdownForm({ data, onChange }: { data: CountdownData; onChange: (d: CountdownData) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Título (opcional)">
        <input className={inputCls} placeholder="Ex: O evento começa em" value={data.title ?? ''} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </Field>
      <p className="text-xs text-text-muted">A contagem regressiva usa automaticamente a data de início do evento.</p>
    </div>
  )
}

// ── Root modal ────────────────────────────────────────────────────────────────
interface Props {
  block: PageBlock
  onSave: (block: PageBlock) => void
  onClose: () => void
}

export function BlockEditModal({ block, onSave, onClose }: Props) {
  const [data, setData] = useState(block.data)
  const meta = BLOCK_META[block.type]

  const handleSave = () => onSave({ ...block, data })

  const renderForm = () => {
    switch (block.type) {
      case 'agenda':    return <AgendaForm data={data as AgendaData} onChange={setData} />
      case 'speakers':  return <SpeakersForm data={data as SpeakersData} onChange={setData} />
      case 'faq':       return <FaqForm data={data as FaqData} onChange={setData} />
      case 'gallery':   return <GalleryForm data={data as GalleryData} onChange={setData} />
      case 'sponsors':  return <SponsorsForm data={data as SponsorsData} onChange={setData} />
      case 'text':      return <TextForm data={data as TextData} onChange={setData} />
      case 'video':     return <VideoForm data={data as VideoData} onChange={setData} />
      case 'countdown': return <CountdownForm data={data as CountdownData} onChange={setData} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-xl flex-col rounded-2xl bg-bg shadow-xl border border-border max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{meta.icon}</span>
            <h3 className="text-base font-semibold text-text">{meta.label}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-surface hover:text-text">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {renderForm()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave}>Salvar bloco</Button>
        </div>
      </div>
    </div>
  )
}
