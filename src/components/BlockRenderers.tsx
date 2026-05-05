import { useState, useEffect } from 'react'
import type {
  PageBlock,
  AgendaData,
  SpeakersData,
  FaqData,
  GalleryData,
  SponsorsData,
  TextData,
  VideoData,
  CountdownData,
} from '@/types/page-builder'

function SectionTitle({ title }: { title?: string }) {
  if (!title) return null
  return <h2 className="text-2xl font-semibold text-[#19162A] mb-6">{title}</h2>
}

function AgendaBlock({ data }: { data: AgendaData }) {
  return (
    <section className="space-y-4">
      <SectionTitle title={data.title} />
      <div className="space-y-2">
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-[#E4E0F0] bg-white">
            <span className="text-sm font-mono font-medium text-[#6A6680] whitespace-nowrap pt-0.5 min-w-[52px]">
              {item.time}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#19162A]">{item.title}</p>
              {item.description && <p className="text-sm text-[#6A6680] mt-0.5">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SpeakersBlock({ data }: { data: SpeakersData }) {
  return (
    <section className="space-y-4">
      <SectionTitle title={data.title} />
      <div className="grid sm:grid-cols-2 gap-4">
        {data.items.map((speaker, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-[#E4E0F0] bg-white">
            {speaker.photoUrl ? (
              <img
                src={speaker.photoUrl}
                alt={speaker.name}
                className="h-14 w-14 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0 text-xl font-bold text-[#7C3AED]">
                {speaker.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-[#19162A]">{speaker.name}</p>
              <p className="text-sm text-[#7C3AED]">{speaker.role}</p>
              {speaker.bio && (
                <p className="text-sm text-[#6A6680] mt-1 leading-relaxed">{speaker.bio}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function FaqBlock({ data }: { data: FaqData }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="space-y-4">
      <SectionTitle title={data.title} />
      <div className="space-y-2">
        {data.items.map((item, i) => (
          <div key={i} className="rounded-xl border border-[#E4E0F0] bg-white overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left flex items-center justify-between gap-3 px-5 py-4"
            >
              <span className="font-medium text-[#19162A] text-sm">{item.question}</span>
              <span
                className="text-[#6A6680] flex-shrink-0 transition-transform duration-200"
                style={{ transform: open === i ? 'rotate(180deg)' : undefined }}
              >
                ▾
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-[#6A6680] leading-relaxed border-t border-[#E4E0F0] pt-3">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function GalleryBlock({ data }: { data: GalleryData }) {
  if (data.images.length === 0) return null
  return (
    <section className="space-y-4">
      <SectionTitle title={data.title} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.images.map((img, i) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#EDE9FE]">
            <img src={img.url} alt={img.caption ?? ''} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}

function SponsorsBlock({ data }: { data: SponsorsData }) {
  if (data.items.length === 0) return null
  return (
    <section className="space-y-4">
      <SectionTitle title={data.title} />
      <div className="flex flex-wrap gap-6 items-center">
        {data.items.map((s, i) => (
          <a
            key={i}
            href={s.website || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={s.website ? 'hover:opacity-75 transition-opacity' : 'cursor-default'}
          >
            {s.logoUrl ? (
              <img src={s.logoUrl} alt={s.name} className="h-12 w-auto max-w-[160px] object-contain" />
            ) : (
              <span className="text-sm font-medium text-[#19162A]">{s.name}</span>
            )}
          </a>
        ))}
      </div>
    </section>
  )
}

function TextBlock({ data }: { data: TextData }) {
  return (
    <section className="space-y-3">
      {data.title && <SectionTitle title={data.title} />}
      <p className="text-[#6A6680] leading-relaxed whitespace-pre-line">{data.content}</p>
    </section>
  )
}

function getEmbedUrl(url: string): string | null {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

function VideoBlock({ data }: { data: VideoData }) {
  const embedUrl = getEmbedUrl(data.url)
  if (!embedUrl) return null
  return (
    <section className="space-y-3">
      {data.title && <SectionTitle title={data.title} />}
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
        <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={data.title ?? 'Vídeo'} />
      </div>
    </section>
  )
}

interface CountdownBlockProps {
  data: CountdownData
  targetDate: string
  targetTime: string
}

function CountdownBlock({ data, targetDate, targetTime }: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const target = new Date(`${targetDate}T${targetTime}`)

    function tick() {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate, targetTime])

  if (!timeLeft) return null

  const units = [
    { label: 'Dias', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Seg', value: timeLeft.seconds },
  ]

  return (
    <section className="space-y-4 text-center py-4">
      {data.title && <h2 className="text-2xl font-semibold text-[#19162A]">{data.title}</h2>}
      <div className="flex justify-center gap-6">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-4xl sm:text-5xl font-bold text-[#7C3AED] tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs text-[#6A6680] uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

interface PageBlockRendererProps {
  block: PageBlock
  eventStartDate: string
  eventStartTime: string
}

export function PageBlockRenderer({ block, eventStartDate, eventStartTime }: PageBlockRendererProps) {
  if (!block.visible) return null

  switch (block.type) {
    case 'agenda':
      return <AgendaBlock data={block.data as AgendaData} />
    case 'speakers':
      return <SpeakersBlock data={block.data as SpeakersData} />
    case 'faq':
      return <FaqBlock data={block.data as FaqData} />
    case 'gallery':
      return <GalleryBlock data={block.data as GalleryData} />
    case 'sponsors':
      return <SponsorsBlock data={block.data as SponsorsData} />
    case 'text':
      return <TextBlock data={block.data as TextData} />
    case 'video':
      return <VideoBlock data={block.data as VideoData} />
    case 'countdown':
      return (
        <CountdownBlock
          data={block.data as CountdownData}
          targetDate={eventStartDate}
          targetTime={eventStartTime}
        />
      )
    default:
      return null
  }
}
