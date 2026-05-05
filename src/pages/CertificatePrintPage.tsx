import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    CertPreview,
    getCertDimensions,
    TEMPLATES,
    parseBodyText,
    DEFAULT_BODY,
    type EditorTemplate,
} from '@/components/CertificateStudioTab'
import type { CertificateSigner } from '@/types/signers'

interface PrintData {
    template: string
    color: string
    bodyText: string
    participant: { name: string; cpf?: string | null; code: string }
    event: {
        title: string
        startDate: string
        workloadHours?: number | null
    }
    signers: Array<{ id: string; name: string; title: string; signatureUrl?: string | null }>
}

export function CertificatePrintPage() {
    const [searchParams] = useSearchParams()
    const key = searchParams.get('k')

    const data = useMemo<PrintData | null>(() => {
        if (!key) return null
        try {
            const raw = sessionStorage.getItem(key)
            if (!raw) return null
            sessionStorage.removeItem(key)
            return JSON.parse(raw) as PrintData
        } catch {
            return null
        }
    }, [key])

    useEffect(() => {
        if (!data) return
        document.fonts.ready.then(() => setTimeout(() => window.print(), 200))
    }, [data])

    if (!data) {
        return (
            <div style={{ fontFamily: 'sans-serif', padding: 32, color: '#666' }}>
                Dados não encontrados. Feche esta janela e tente novamente.
            </div>
        )
    }

    const template = (data.template as EditorTemplate) ?? 'DEFAULT'
    const info = TEMPLATES.find((t) => t.id === template)
    const isLandscape = info?.orientation === 'landscape'
    const { w, h } = getCertDimensions(template)

    const date = data.event.startDate
        ? new Date(data.event.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
        : ''
    const hours = data.event.workloadHours ? `${data.event.workloadHours} horas` : null

    const bodyText = data.bodyText || DEFAULT_BODY
    const bodyNode = parseBodyText(
        bodyText,
        data.color,
        data.event.title,
        date,
        hours,
        data.participant.name,
        data.participant.cpf ?? undefined,
    )

    const signers: CertificateSigner[] = data.signers.map((s) => ({
        id: s.id,
        eventId: '',
        name: s.name,
        title: s.title,
        signatureUrl: s.signatureUrl ?? null,
        displayOrder: 0,
        createdAt: '',
        updatedAt: '',
    }))

    // Build a minimal EventDetail-compatible shape — cert components only use these fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventShape: any = {
        title: data.event.title,
        startDate: data.event.startDate,
        workloadHours: data.event.workloadHours ?? null,
        primaryColor: data.color,
        certificateTemplate: template,
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html, body { background: white; }
                @media print {
                    @page { size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'}; margin: 0; }
                }
                @media screen {
                    body {
                        background: #e8e8e6;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding: 40px;
                    }
                }
            `}</style>
            <div style={{ width: w, height: h, position: 'relative', flexShrink: 0 }}>
                <CertPreview
                    template={template}
                    color={data.color}
                    event={eventShape}
                    signers={signers}
                    bodyNode={bodyNode}
                />
            </div>
        </>
    )
}
