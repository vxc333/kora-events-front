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

export const BLOCK_META: Record<BlockType, { label: string; icon: string; defaultData: BlockData }> = {
  agenda: {
    label: 'Agenda',
    icon: '📅',
    defaultData: { title: 'Programação', items: [{ time: '09:00', title: 'Abertura' }] } as AgendaData,
  },
  speakers: {
    label: 'Palestrantes',
    icon: '🎤',
    defaultData: { title: 'Palestrantes', items: [{ name: 'Nome', role: 'Cargo' }] } as SpeakersData,
  },
  faq: {
    label: 'FAQ',
    icon: '❓',
    defaultData: { title: 'Perguntas frequentes', items: [{ question: 'Pergunta?', answer: 'Resposta.' }] } as FaqData,
  },
  gallery: {
    label: 'Galeria',
    icon: '🖼️',
    defaultData: { title: 'Galeria', images: [] } as GalleryData,
  },
  sponsors: {
    label: 'Patrocinadores',
    icon: '🤝',
    defaultData: { title: 'Patrocinadores', items: [] } as SponsorsData,
  },
  text: {
    label: 'Texto livre',
    icon: '📝',
    defaultData: { title: '', content: 'Escreva aqui...' } as TextData,
  },
  video: {
    label: 'Vídeo',
    icon: '▶️',
    defaultData: { title: '', url: '' } as VideoData,
  },
  countdown: {
    label: 'Contagem regressiva',
    icon: '⏱️',
    defaultData: {} as CountdownData,
  },
}
