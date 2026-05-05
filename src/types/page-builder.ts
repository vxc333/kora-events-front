export type BlockType =
  | 'agenda'
  | 'speakers'
  | 'faq'
  | 'gallery'
  | 'sponsors'
  | 'text'
  | 'video'
  | 'countdown'

export interface AgendaItem { time: string; title: string; description?: string }
export interface SpeakerItem { name: string; role: string; bio?: string; photoUrl?: string }
export interface FaqItem { question: string; answer: string }
export interface GalleryImage { url: string; caption?: string }
export interface SponsorItem { name: string; logoUrl: string; website?: string }

export interface AgendaData { title: string; items: AgendaItem[] }
export interface SpeakersData { title: string; items: SpeakerItem[] }
export interface FaqData { title: string; items: FaqItem[] }
export interface GalleryData { title: string; images: GalleryImage[] }
export interface SponsorsData { title: string; items: SponsorItem[] }
export interface TextData { title?: string; content: string }
export interface VideoData { title?: string; url: string }
export interface CountdownData { title?: string }

export type BlockData =
  | AgendaData
  | SpeakersData
  | FaqData
  | GalleryData
  | SponsorsData
  | TextData
  | VideoData
  | CountdownData

export interface PageBlock {
  id: string
  type: BlockType
  order: number
  visible: boolean
  data: BlockData
}

export type HeroLayout = 'banner' | 'split'
export type TitleFont = 'dm-serif' | 'inter' | 'playfair'

export interface PageSettings {
  bgColor: string
  heroLayout: HeroLayout
  titleFont: TitleFont
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  bgColor: '#FDFCFF',
  heroLayout: 'banner',
  titleFont: 'dm-serif',
}

import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Mic2, HelpCircle, Images, Handshake, FileText, PlayCircle, Timer } from 'lucide-react'

export type BlockIconMeta = { icon: LucideIcon; color: string; bg: string }

export const BLOCK_META: Record<BlockType, { label: string; icon: LucideIcon; color: string; bg: string; defaultData: BlockData }> = {
  agenda: {
    label: 'Agenda',
    icon: CalendarDays,
    color: '#7C3AED',
    bg: '#F5F3FF',
    defaultData: { title: 'Programação', items: [{ time: '09:00', title: 'Abertura' }] } as AgendaData,
  },
  speakers: {
    label: 'Palestrantes',
    icon: Mic2,
    color: '#2563EB',
    bg: '#EFF6FF',
    defaultData: { title: 'Palestrantes', items: [{ name: 'Nome', role: 'Cargo' }] } as SpeakersData,
  },
  faq: {
    label: 'FAQ',
    icon: HelpCircle,
    color: '#D97706',
    bg: '#FFFBEB',
    defaultData: { title: 'Perguntas frequentes', items: [{ question: 'Pergunta?', answer: 'Resposta.' }] } as FaqData,
  },
  gallery: {
    label: 'Galeria',
    icon: Images,
    color: '#E11D48',
    bg: '#FFF1F2',
    defaultData: { title: 'Galeria', images: [] } as GalleryData,
  },
  sponsors: {
    label: 'Patrocinadores',
    icon: Handshake,
    color: '#059669',
    bg: '#ECFDF5',
    defaultData: { title: 'Patrocinadores', items: [] } as SponsorsData,
  },
  text: {
    label: 'Texto livre',
    icon: FileText,
    color: '#475569',
    bg: '#F1F5F9',
    defaultData: { title: '', content: 'Escreva aqui...' } as TextData,
  },
  video: {
    label: 'Vídeo',
    icon: PlayCircle,
    color: '#DC2626',
    bg: '#FEF2F2',
    defaultData: { title: '', url: '' } as VideoData,
  },
  countdown: {
    label: 'Contagem regressiva',
    icon: Timer,
    color: '#4F46E5',
    bg: '#EEF2FF',
    defaultData: {} as CountdownData,
  },
}
