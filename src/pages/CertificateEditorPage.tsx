import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, Save, Lock, Sparkles, Check, RefreshCw, Palette } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { useSigners } from "@/hooks/useSigners";
import * as eventsService from "@/services/events";
import type { CertificateTemplate, EventDetail } from "@/types/events";
import type { CertificateSigner } from "@/types/signers";
import { cn } from "@/lib/utils";

// ─── Certificate dimensions (PDF points → CSS px) ─────────────────────────
const A4_P_W = 595;
const A4_P_H = 842;
const A4_L_W = 842;
const A4_L_H = 595;

// ─── Template registry ────────────────────────────────────────────────────
type EditorTemplate = CertificateTemplate | "NOIR" | "GOLD" | "EDITORIAL" | "DIPLOMA" | "WAVE";

interface TemplateInfo {
    id: EditorTemplate;
    name: string;
    description: string;
    orientation: "portrait" | "landscape";
    pro: boolean;
}

const TEMPLATES: TemplateInfo[] = [
    { id: "DEFAULT", name: "Clássico", description: "Retrato com cabeçalho colorido", orientation: "portrait", pro: false },
    { id: "LANDSCAPE", name: "Paisagem", description: "Horizontal em duas colunas", orientation: "landscape", pro: false },
    { id: "MINIMALIST", name: "Minimalista", description: "Clean, tipografia em destaque", orientation: "portrait", pro: false },
    { id: "NOIR", name: "Noir", description: "Fundo escuro, elegância dramática", orientation: "landscape", pro: true },
    { id: "GOLD", name: "Dourado", description: "Luxo com detalhes em ouro", orientation: "portrait", pro: true },
    { id: "EDITORIAL", name: "Editorial", description: "Tipografia ousada de revista", orientation: "landscape", pro: true },
    { id: "DIPLOMA", name: "Diploma", description: "Borda clássica de diploma", orientation: "landscape", pro: true },
    { id: "WAVE", name: "Moderno", description: "Formas geométricas e cor vibrante", orientation: "portrait", pro: true },
];

const COLOR_PRESETS = [
    "#5B21B6",
    "#7C3AED",
    "#1D4ED8",
    "#0369A1",
    "#059669",
    "#16A34A",
    "#D97706",
    "#B45309",
    "#DC2626",
    "#E11D48",
    "#BE185D",
    "#475569",
];

// ─── Certificate preview renderers ────────────────────────────────────────
interface PreviewProps {
    color: string;
    event: EventDetail | null;
    signers: CertificateSigner[];
}

function DefaultCert({ color, event, signers }: PreviewProps) {
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
        : "1 de janeiro de 2026";
    const hours = event?.workloadHours;

    return (
        <div
            style={{
                width: A4_P_W,
                height: A4_P_H,
                background: "#fff",
                padding: "60px",
                fontFamily: "Georgia, serif",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxSizing: "border-box",
            }}
        >
            {/* Top rule */}
            <div style={{ height: 4, background: color, marginBottom: 32 }} />

            {/* Body */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 0,
                }}
            >
                <div
                    style={{
                        fontSize: 11,
                        fontFamily: '"DM Sans", sans-serif',
                        letterSpacing: "0.15em",
                        color: "#888",
                        textTransform: "uppercase",
                        marginBottom: 28,
                    }}
                >
                    Certificado de Participação
                </div>
                <div style={{ fontSize: 13, color: "#999", marginBottom: 10, fontFamily: '"DM Sans", sans-serif' }}>Certificamos que</div>
                <div style={{ fontSize: 38, fontWeight: "bold", color, marginBottom: 16, lineHeight: 1.2 }}>Nome do Participante</div>
                <div style={{ fontSize: 13, color: "#999", marginBottom: 10, fontFamily: '"DM Sans", sans-serif' }}>
                    participou do evento
                </div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#1a1a2e", marginBottom: 12 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#666", marginBottom: hours ? 8 : 20, fontFamily: '"DM Sans", sans-serif' }}>
                    realizado em {date}
                </div>
                {hours && (
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 20, fontFamily: '"DM Sans", sans-serif' }}>
                        com carga horária de {hours} horas
                    </div>
                )}
                <div style={{ fontSize: 9, color: "#ccc", fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.1em" }}>
                    CÓDIGO DE VALIDAÇÃO: ABC12345
                </div>
            </div>

            {/* Bottom rule */}
            <div style={{ height: 1, background: color, opacity: 0.3, marginBottom: 24 }} />

            {/* Signers */}
            {signers.length > 0 ? (
                <div style={{ display: "flex", justifyContent: "center", gap: 48 }}>
                    {signers.slice(0, 3).map((s) => (
                        <div key={s.id} style={{ textAlign: "center", minWidth: 100 }}>
                            <div style={{ height: 32, marginBottom: 6, borderBottom: "0.5px solid #555" }} />
                            <div style={{ fontSize: 10, fontWeight: "bold", color: "#1a1a2e", fontFamily: '"DM Sans", sans-serif' }}>
                                {s.name}
                            </div>
                            <div style={{ fontSize: 9, color: "#666", fontFamily: '"DM Sans", sans-serif' }}>{s.title}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "center", gap: 48 }}>
                    {[
                        { name: "Assinante 1", title: "Cargo / Título" },
                        { name: "Assinante 2", title: "Cargo / Título" },
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: "center", minWidth: 100, opacity: 0.3 }}>
                            <div style={{ height: 32, marginBottom: 6, borderBottom: "0.5px solid #999" }} />
                            <div style={{ fontSize: 10, fontFamily: '"DM Sans", sans-serif' }}>{s.name}</div>
                            <div style={{ fontSize: 9, color: "#888", fontFamily: '"DM Sans", sans-serif' }}>{s.title}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function LandscapeCert({ color, event, signers }: PreviewProps) {
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : "01 jan 2026";
    const hours = event?.workloadHours;

    return (
        <div
            style={{
                width: A4_L_W,
                height: A4_L_H,
                background: "#fff",
                padding: "50px 60px",
                fontFamily: "Georgia, serif",
                display: "flex",
                alignItems: "stretch",
                boxSizing: "border-box",
                gap: 0,
            }}
        >
            {/* Left column */}
            <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 40 }}>
                <div
                    style={{
                        fontSize: 9,
                        fontFamily: '"DM Sans", sans-serif',
                        letterSpacing: "0.15em",
                        color: "#888",
                        textTransform: "uppercase",
                        marginBottom: 20,
                    }}
                >
                    Certificado de Participação
                </div>
                <div style={{ fontSize: 11, color: "#999", marginBottom: 6, fontFamily: '"DM Sans", sans-serif' }}>Certificamos que</div>
                <div style={{ fontSize: 30, fontWeight: "bold", color, marginBottom: 14, lineHeight: 1.2 }}>Nome do Participante</div>
                <div style={{ fontSize: 11, color: "#999", marginBottom: 6, fontFamily: '"DM Sans", sans-serif' }}>
                    participou do evento
                </div>
                <div style={{ fontSize: 15, fontWeight: "bold", color: "#1a1a2e", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: '"DM Sans", sans-serif' }}>
                    {date}
                    {hours ? ` · ${hours}h` : ""}
                </div>
                <div style={{ fontSize: 8, color: "#bbb", marginTop: 14, fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.08em" }}>
                    Código: ABC12345
                </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: color, margin: "0 0" }} />

            {/* Right column - signers */}
            <div style={{ flex: 1, paddingLeft: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div
                    style={{
                        fontSize: 9,
                        color: "#888",
                        fontFamily: '"DM Sans", sans-serif',
                        marginBottom: 24,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                    }}
                >
                    Assinaturas
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {(signers.length > 0
                        ? signers.slice(0, 3)
                        : ([
                              { id: "1", name: "Assinante 1", title: "Cargo" },
                              { id: "2", name: "Assinante 2", title: "Cargo" },
                          ] as CertificateSigner[])
                    ).map((s) => (
                        <div key={s.id} style={{ opacity: signers.length === 0 ? 0.3 : 1 }}>
                            <div style={{ height: 28, borderBottom: "0.5px solid #555", marginBottom: 4 }} />
                            <div style={{ fontSize: 10, fontWeight: "bold", color: "#1a1a2e", fontFamily: '"DM Sans", sans-serif' }}>
                                {s.name}
                            </div>
                            <div style={{ fontSize: 9, color: "#666", fontFamily: '"DM Sans", sans-serif' }}>{s.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MinimalistCert({ color, event, signers }: PreviewProps) {
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
        : "1 de janeiro de 2026";
    const hours = event?.workloadHours;

    return (
        <div
            style={{
                width: A4_P_W,
                height: A4_P_H,
                background: "#fff",
                padding: "80px",
                fontFamily: "Georgia, serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    fontSize: 10,
                    fontFamily: '"DM Sans", sans-serif',
                    letterSpacing: "0.2em",
                    color: "#aaa",
                    textTransform: "uppercase",
                    marginBottom: 20,
                }}
            >
                Certificado
            </div>
            <div style={{ height: 1, background: color, width: "100%", marginBottom: 40 }} />
            <div style={{ fontSize: 40, fontWeight: "bold", color: "#1a1a2e", marginBottom: 24, lineHeight: 1.2 }}>
                Nome do Participante
            </div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 10, fontFamily: '"DM Sans", sans-serif' }}>participou de</div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a2e", marginBottom: 12 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 60, fontFamily: '"DM Sans", sans-serif' }}>
                {date}
                {hours ? ` · ${hours} horas` : ""}
            </div>
            {signers.length > 0 ? (
                <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 24 }}>
                    {signers.slice(0, 3).map((s) => (
                        <div key={s.id} style={{ textAlign: "center", minWidth: 100 }}>
                            <div style={{ height: 28, borderBottom: "0.5px solid #555", marginBottom: 5 }} />
                            <div style={{ fontSize: 10, fontWeight: "bold", fontFamily: '"DM Sans", sans-serif' }}>{s.name}</div>
                            <div style={{ fontSize: 9, color: "#888", fontFamily: '"DM Sans", sans-serif' }}>{s.title}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ height: 60 }} />
            )}
            <div style={{ fontSize: 9, color: "#ccc", fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.12em" }}>Código ABC12345</div>
        </div>
    );
}

function NoirCert({ color }: PreviewProps) {
    return (
        <div
            style={{
                width: A4_L_W,
                height: A4_L_H,
                background: "#0D0B14",
                padding: "50px 60px",
                fontFamily: "Georgia, serif",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: -80,
                    right: -80,
                    width: 320,
                    height: 320,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}22, transparent 70%)`,
                }}
            />
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        color: color,
                        textTransform: "uppercase",
                        fontFamily: '"DM Sans", sans-serif',
                        marginBottom: 20,
                    }}
                >
                    Certificado de Participação
                </div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>Certificamos que</div>
                <div style={{ fontSize: 34, fontWeight: "bold", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
                    Nome do Participante
                </div>
                <div style={{ width: 40, height: 2, background: color, marginBottom: 16 }} />
                <div style={{ fontSize: 14, fontWeight: "bold", color: "#e2e2e2" }}>Nome do Evento</div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 8, fontFamily: '"DM Sans", sans-serif' }}>1 de janeiro de 2026</div>
            </div>
        </div>
    );
}

function GoldCert({ color }: PreviewProps) {
    const gold = "#C9A84C";
    return (
        <div
            style={{
                width: A4_P_W,
                height: A4_P_H,
                background: "#FEFBF3",
                padding: "60px",
                fontFamily: "Georgia, serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                boxSizing: "border-box",
                border: `1px solid ${gold}40`,
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: 2,
                    background: `linear-gradient(to right, transparent, ${gold}, transparent)`,
                    marginBottom: 40,
                }}
            />
            <div
                style={{
                    fontSize: 11,
                    letterSpacing: "0.3em",
                    color: gold,
                    textTransform: "uppercase",
                    fontFamily: '"DM Sans", sans-serif',
                    marginBottom: 24,
                }}
            >
                Certificado de Excelência
            </div>
            <div style={{ fontSize: 38, fontWeight: "bold", color: "#2A1A00", marginBottom: 16, lineHeight: 1.2 }}>
                Nome do Participante
            </div>
            <div style={{ width: 60, height: 1, background: gold, marginBottom: 16 }} />
            <div style={{ fontSize: 15, color: "#5A3E00", marginBottom: 8 }}>Nome do Evento</div>
            <div style={{ fontSize: 11, color: "#AA8840", fontFamily: '"DM Sans", sans-serif', marginBottom: 40 }}>
                1 de janeiro de 2026
            </div>
            <div style={{ width: "100%", height: 2, background: `linear-gradient(to right, transparent, ${gold}, transparent)` }} />
        </div>
    );
}

function EditorialCert({ color }: PreviewProps) {
    return (
        <div
            style={{
                width: A4_L_W,
                height: A4_L_H,
                background: "#F8F8F6",
                boxSizing: "border-box",
                display: "flex",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <div
                style={{
                    width: "40%",
                    background: color,
                    padding: "50px 40px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                }}
            >
                <div
                    style={{
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.6)",
                        textTransform: "uppercase",
                        fontFamily: '"DM Sans", sans-serif',
                        marginBottom: 12,
                    }}
                >
                    Certificado
                </div>
                <div style={{ fontSize: 28, fontWeight: "bold", color: "#fff", lineHeight: 1.1 }}>
                    Nome do
                    <br />
                    Participante
                </div>
            </div>
            <div style={{ flex: 1, padding: "50px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div
                    style={{
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        color: "#aaa",
                        textTransform: "uppercase",
                        fontFamily: '"DM Sans", sans-serif',
                        marginBottom: 16,
                    }}
                >
                    participou do evento
                </div>
                <div style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a", marginBottom: 12, lineHeight: 1.3 }}>Nome do Evento</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: '"DM Sans", sans-serif', marginBottom: 40 }}>
                    1 de janeiro de 2026
                </div>
                <div style={{ height: 1, background: "#ddd", marginBottom: 16 }} />
                <div style={{ fontSize: 9, color: "#ccc", fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.1em" }}>ABC12345</div>
            </div>
        </div>
    );
}

function DiplomaCert({ color }: PreviewProps) {
    return (
        <div
            style={{
                width: A4_L_W,
                height: A4_L_H,
                background: "#FFFEF8",
                padding: "24px",
                boxSizing: "border-box",
                fontFamily: "Georgia, serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    border: `3px double ${color}`,
                    padding: "28px 44px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: 9,
                        letterSpacing: "0.25em",
                        color,
                        textTransform: "uppercase",
                        fontFamily: '"DM Sans", sans-serif',
                        marginBottom: 16,
                    }}
                >
                    República — Certificamos
                </div>
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#1a1a2e", marginBottom: 12, letterSpacing: "0.05em" }}>
                    CERTIFICADO DE PARTICIPAÇÃO
                </div>
                <div style={{ width: 60, height: 1, background: color, margin: "0 auto 16px" }} />
                <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>
                    Conferimos o presente diploma a
                </div>
                <div style={{ fontSize: 32, fontWeight: "bold", color, marginBottom: 8, lineHeight: 1.2, fontStyle: "italic" }}>
                    Nome do Participante
                </div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontFamily: '"DM Sans", sans-serif' }}>
                    por sua participação em
                </div>
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#1a1a2e", marginBottom: 8 }}>Nome do Evento</div>
                <div style={{ fontSize: 10, color: "#888", fontFamily: '"DM Sans", sans-serif' }}>1 de janeiro de 2026</div>
            </div>
        </div>
    );
}

function WaveCert({ color }: PreviewProps) {
    return (
        <div
            style={{
                width: A4_P_W,
                height: A4_P_H,
                background: "#fff",
                boxSizing: "border-box",
                fontFamily: '"DM Sans", sans-serif',
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    height: "45%",
                    background: color,
                    padding: "48px 52px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    position: "relative",
                }}
            >
                <svg
                    style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}
                    viewBox="0 0 595 40"
                    preserveAspectRatio="none"
                    height={40}
                >
                    <path d="M0,40 L0,20 Q148,0 297,20 Q446,40 595,20 L595,40 Z" fill="#fff" />
                </svg>
                <div
                    style={{
                        fontSize: 9,
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.7)",
                        textTransform: "uppercase",
                        marginBottom: 12,
                    }}
                >
                    Certificado
                </div>
                <div style={{ fontSize: 36, fontWeight: "900", color: "#fff", lineHeight: 1.1 }}>
                    Nome do
                    <br />
                    Participante
                </div>
            </div>
            <div style={{ flex: 1, padding: "48px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>participou do evento</div>
                <div style={{ fontSize: 20, fontWeight: "700", color: "#1a1a2e", marginBottom: 10 }}>Nome do Evento</div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 32 }}>1 de janeiro de 2026</div>
                <div style={{ fontSize: 8, color: "#ddd", letterSpacing: "0.12em" }}>CÓDIGO ABC12345</div>
            </div>
        </div>
    );
}

// ─── Certificate preview dispatcher ───────────────────────────────────────
function CertificatePreview({ template, color, event, signers }: { template: EditorTemplate } & PreviewProps) {
    const props = { color, event, signers };
    switch (template) {
        case "DEFAULT":
            return <DefaultCert {...props} />;
        case "LANDSCAPE":
            return <LandscapeCert {...props} />;
        case "MINIMALIST":
            return <MinimalistCert {...props} />;
        case "NOIR":
            return <NoirCert {...props} />;
        case "GOLD":
            return <GoldCert {...props} />;
        case "EDITORIAL":
            return <EditorialCert {...props} />;
        case "DIPLOMA":
            return <DiplomaCert {...props} />;
        case "WAVE":
            return <WaveCert {...props} />;
    }
}

function getCertDimensions(template: EditorTemplate) {
    const info = TEMPLATES.find((t) => t.id === template);
    return info?.orientation === "landscape" ? { w: A4_L_W, h: A4_L_H } : { w: A4_P_W, h: A4_P_H };
}

// ─── Scaled preview wrapper ────────────────────────────────────────────────
function ScaledCertificate({
    template,
    color,
    event,
    signers,
    scale,
    className,
}: {
    template: EditorTemplate;
    color: string;
    event: EventDetail | null;
    signers: CertificateSigner[];
    scale: number;
    className?: string;
}) {
    const { w, h } = getCertDimensions(template);
    return (
        <div className={className} style={{ width: w * scale, height: h * scale, overflow: "hidden", flexShrink: 0 }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <CertificatePreview template={template} color={color} event={event} signers={signers} />
            </div>
        </div>
    );
}

// ─── Template thumbnail card ───────────────────────────────────────────────
function TemplateThumbnail({
    info,
    color,
    event,
    signers,
    selected,
    onClick,
}: {
    info: TemplateInfo;
    color: string;
    event: EventDetail | null;
    signers: CertificateSigner[];
    selected: boolean;
    onClick: () => void;
}) {
    const { w, h } = getCertDimensions(info.id);
    const thumbW = 120;
    const thumbH = Math.round((h / w) * thumbW);
    const scale = thumbW / w;

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative group flex flex-col gap-2 text-left transition-all duration-200",
                selected ? "opacity-100" : "opacity-60 hover:opacity-100",
            )}
        >
            {/* Thumbnail */}
            <div
                className={cn(
                    "relative rounded-lg overflow-hidden transition-all duration-200",
                    selected ? "ring-2 ring-offset-2 ring-offset-[#13111D]" : "ring-1 ring-white/10 group-hover:ring-white/20",
                )}
                style={{ ringColor: color, width: thumbW, height: thumbH }}
            >
                {selected && <div className="absolute inset-0 ring-2 rounded-lg z-10 pointer-events-none" style={{ borderColor: color }} />}
                <ScaledCertificate template={info.id} color={color} event={event} signers={signers} scale={scale} />
                {info.pro && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-yellow-300 bg-yellow-400/20 border border-yellow-400/30">
                            <Lock className="h-2.5 w-2.5" />
                            PRO
                        </span>
                    </div>
                )}
            </div>

            {/* Label */}
            <div>
                <p className="text-[11px] font-medium text-white/80 leading-none mb-0.5">{info.name}</p>
                <p className="text-[9px] text-white/30 leading-tight">{info.description}</p>
            </div>
        </button>
    );
}

// ─── Color picker ─────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
    const [hex, setHex] = useState(value);
    const [valid, setValid] = useState(true);

    useEffect(() => {
        setHex(value);
    }, [value]);

    const handleHex = (v: string) => {
        setHex(v);
        const full = v.startsWith("#") ? v : `#${v}`;
        if (/^#[0-9a-fA-F]{6}$/.test(full)) {
            setValid(true);
            onChange(full);
        } else {
            setValid(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-6 gap-1.5">
                {COLOR_PRESETS.map((c) => (
                    <button
                        key={c}
                        onClick={() => {
                            onChange(c);
                            setHex(c);
                            setValid(true);
                        }}
                        className={cn(
                            "h-6 w-6 rounded-md transition-all duration-150 hover:scale-110",
                            value === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#1E1C2C]" : "",
                        )}
                        style={{ background: c }}
                    />
                ))}
            </div>
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded shrink-0" style={{ background: valid ? value : "#ccc" }} />
                <input
                    type="text"
                    value={hex}
                    onChange={(e) => handleHex(e.target.value)}
                    placeholder="#5B21B6"
                    className={cn(
                        "flex-1 bg-[#0F0D18] border rounded-md px-2.5 py-1.5 text-xs font-mono text-white/80 outline-none transition-colors",
                        valid ? "border-white/10 focus:border-white/30" : "border-red-500/50",
                    )}
                />
            </div>
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export function CertificateEditorPage() {
    const { id = "" } = useParams<{ id: string }>();
    const { event } = useEvent(id);
    const { signers } = useSigners(id);
    const queryClient = useQueryClient();

    const [template, setTemplate] = useState<EditorTemplate>("DEFAULT");
    const [color, setColor] = useState("#5B21B6");
    const [saved, setSaved] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasScale, setCanvasScale] = useState(0.72);

    // Sync from loaded event
    useEffect(() => {
        if (event) {
            setColor(event.primaryColor ?? "#5B21B6");
            if (event.certificateTemplate) setTemplate(event.certificateTemplate as EditorTemplate);
        }
    }, [event]);

    // Compute canvas scale dynamically
    useEffect(() => {
        const computeScale = () => {
            if (!canvasRef.current) return;
            const { w, h } = getCertDimensions(template);
            const availW = canvasRef.current.clientWidth - 64;
            const availH = canvasRef.current.clientHeight - 64;
            const s = Math.min(availW / w, availH / h, 1);
            setCanvasScale(Math.max(s, 0.4));
        };
        computeScale();
        const ro = new ResizeObserver(computeScale);
        if (canvasRef.current) ro.observe(canvasRef.current);
        return () => ro.disconnect();
    }, [template]);

    const mutation = useMutation({
        mutationFn: () =>
            eventsService.updateEvent(id, {
                primaryColor: color,
                certificateTemplate:
                    template === "DEFAULT" || template === "LANDSCAPE" || template === "MINIMALIST"
                        ? (template as CertificateTemplate)
                        : undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", id] });
            toast.success("Configurações salvas!");
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        },
        onError: () => toast.error("Erro ao salvar."),
    });

    const handleTemplateClick = useCallback((t: EditorTemplate) => {
        const info = TEMPLATES.find((x) => x.id === t);
        if (info?.pro) {
            toast("Disponível no plano Pro", { icon: "✨" });
            return;
        }
        setTemplate(t);
    }, []);

    const { w: certW, h: certH } = getCertDimensions(template);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0F0D18] select-none">
            {/* ── Top bar ── */}
            <header className="h-12 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#13111D] flex-shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <Link
                        to={`/events/${id}`}
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Voltar
                    </Link>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ background: color }}>
                            <span className="text-white text-[9px] font-bold">C</span>
                        </div>
                        <span className="text-xs font-medium text-white/70">Certificate Studio</span>
                        {event && <span className="text-xs text-white/30">— {event.title}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/30 italic">{TEMPLATES.find((t) => t.id === template)?.name}</span>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                            saved
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                : "bg-white/90 text-[#0F0D18] hover:bg-white",
                            mutation.isPending && "opacity-60",
                        )}
                    >
                        {saved ? (
                            <Check className="h-3 w-3" />
                        ) : mutation.isPending ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                            <Save className="h-3 w-3" />
                        )}
                        {saved ? "Salvo" : "Salvar"}
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* ── Left panel — Templates ── */}
                <aside className="w-44 flex-shrink-0 border-r border-white/[0.06] bg-[#13111D] flex flex-col overflow-y-auto">
                    <div className="px-3 pt-4 pb-2">
                        <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Templates</p>
                    </div>
                    <div className="px-3 pb-4 flex flex-col gap-4">
                        {TEMPLATES.map((info) => (
                            <TemplateThumbnail
                                key={info.id}
                                info={info}
                                color={color}
                                event={event}
                                signers={signers}
                                selected={template === info.id}
                                onClick={() => handleTemplateClick(info.id)}
                            />
                        ))}
                    </div>
                </aside>

                {/* ── Center — Canvas ── */}
                <main
                    ref={canvasRef}
                    className="flex-1 overflow-auto flex items-center justify-center relative"
                    style={{
                        background: "radial-gradient(ellipse at center, #1A1826 0%, #0F0D18 100%)",
                        backgroundImage:
                            "radial-gradient(ellipse at center, #1A1826 0%, #0F0D18 100%), repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,0.02) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(255,255,255,0.02) 24px)",
                    }}
                >
                    {/* Canvas grid */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    />

                    {/* Certificate shadow + paper feel */}
                    <div
                        className="relative z-10"
                        style={{
                            filter: "drop-shadow(0 24px 64px rgba(0,0,0,0.8)) drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
                            width: certW * canvasScale,
                            height: certH * canvasScale,
                        }}
                    >
                        <ScaledCertificate template={template} color={color} event={event} signers={signers} scale={canvasScale} />
                    </div>

                    {/* Dimensions badge */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#13111D]/80 backdrop-blur-sm border border-white/[0.06] rounded-full px-3 py-1.5">
                        <span className="text-[10px] text-white/30 font-mono">
                            A4 {TEMPLATES.find((t) => t.id === template)?.orientation === "landscape" ? "297×210mm" : "210×297mm"}
                        </span>
                        <span className="text-[10px] text-white/20">·</span>
                        <span className="text-[10px] text-white/30 font-mono">{Math.round(canvasScale * 100)}%</span>
                    </div>
                </main>

                {/* ── Right panel — Properties ── */}
                <aside className="w-56 flex-shrink-0 border-l border-white/[0.06] bg-[#13111D] flex flex-col overflow-y-auto">
                    {/* Color section */}
                    <div className="p-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="h-3.5 w-3.5 text-white/40" />
                            <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Cor principal</p>
                        </div>
                        <ColorPicker value={color} onChange={setColor} />
                    </div>

                    {/* Signers section */}
                    <div className="p-4 border-b border-white/[0.06]">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Assinantes</p>
                            <span className="text-[10px] text-white/20">{signers.length}/5</span>
                        </div>
                        {signers.length === 0 ? (
                            <div className="text-center py-3">
                                <p className="text-[10px] text-white/20 leading-relaxed">
                                    Nenhum assinante.
                                    <br />
                                    Adicione na aba Assinantes.
                                </p>
                                <Link
                                    to={`/events/${id}`}
                                    className="inline-block mt-2 text-[10px] text-brand hover:text-brand-muted transition-colors"
                                >
                                    Gerenciar →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {signers.map((s, i) => (
                                    <div key={s.id} className="flex items-center gap-2">
                                        <div
                                            className="h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                            style={{ background: `${color}33`, border: `1px solid ${color}44` }}
                                        >
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-white/70 truncate">{s.name}</p>
                                            <p className="text-[9px] text-white/30 truncate">{s.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pro upsell */}
                    <div className="p-4">
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-400/5 p-3 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-yellow-400" />
                                <p className="text-[10px] font-semibold text-yellow-400">Pro — em breve</p>
                            </div>
                            <p className="text-[9px] text-white/30 leading-relaxed">
                                Drag-and-drop de campos, 8 templates premium, exportação em alta resolução e personalização completa.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
