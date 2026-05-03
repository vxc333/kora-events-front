import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Lock, Check, RefreshCw, Palette, Image as ImageIcon, Upload, X, Type, ExternalLink, Sparkles, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as eventsService from "@/services/events";
import type { CertificateTemplate, EventDetail } from "@/types/events";
import type { CertificateSigner } from "@/types/signers";
import { cn } from "@/lib/utils";

// ─── Dimensions ───────────────────────────────────────────────────────────────
const A4_P_W = 595;
const A4_P_H = 842;
const A4_L_W = 842;
const A4_L_H = 595;

// ─── Types ────────────────────────────────────────────────────────────────────
type EditorTemplate = CertificateTemplate | "NOIR" | "GOLD" | "EDITORIAL" | "DIPLOMA" | "WAVE";

interface TemplateInfo {
    id: EditorTemplate;
    name: string;
    orientation: "portrait" | "landscape";
    pro: boolean;
}

const TEMPLATES: TemplateInfo[] = [
    { id: "DEFAULT", name: "Clássico", orientation: "portrait", pro: false },
    { id: "LANDSCAPE", name: "Paisagem", orientation: "landscape", pro: false },
    { id: "MINIMALIST", name: "Minimalista", orientation: "portrait", pro: false },
    { id: "NOIR", name: "Noir", orientation: "landscape", pro: true },
    { id: "GOLD", name: "Dourado", orientation: "portrait", pro: true },
    { id: "EDITORIAL", name: "Editorial", orientation: "landscape", pro: true },
    { id: "DIPLOMA", name: "Diploma", orientation: "landscape", pro: true },
    { id: "WAVE", name: "Moderno", orientation: "portrait", pro: true },
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

const VARIABLES = [
    { key: "{{nome}}", label: "Nome completo" },
    { key: "{{cpf}}", label: "CPF" },
    { key: "{{email}}", label: "E-mail" },
    { key: "{{evento}}", label: "Evento" },
    { key: "{{data}}", label: "Data" },
    { key: "{{carga_horaria}}", label: "Carga horária" },
    { key: "{{codigo}}", label: "Código" },
];

const DEFAULT_BODY = "Certificamos que {{nome}} participou do evento {{evento}}, realizado em {{data}}.";

function getCertDimensions(t: EditorTemplate) {
    const info = TEMPLATES.find((x) => x.id === t);
    return info?.orientation === "landscape" ? { w: A4_L_W, h: A4_L_H } : { w: A4_P_W, h: A4_P_H };
}

// ─── Variable parser ──────────────────────────────────────────────────────────
function parseBodyText(text: string, color: string, eventTitle: string, date: string, hours: string | null): React.ReactNode {
    const varMap: Record<string, { value: string; style: React.CSSProperties }> = {
        nome: { value: "Maria Silva Santos", style: { fontWeight: "700", color, letterSpacing: "-0.01em" } },
        cpf: { value: "000.000.000-00", style: { fontFamily: "monospace" } },
        email: { value: "participante@email.com", style: {} },
        evento: { value: eventTitle, style: { fontWeight: "600" } },
        data: { value: date, style: {} },
        carga_horaria: { value: hours ?? "40 horas", style: {} },
        codigo: { value: "ABC12345", style: { fontFamily: "monospace", opacity: 0.7 } },
    };

    const parts: Array<{ text: string; varName?: string }> = [];
    const pattern = /\{\{(nome|cpf|email|evento|data|carga_horaria|codigo)\}\}/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
        if (m.index > last) parts.push({ text: text.slice(last, m.index) });
        parts.push({ text: m[0], varName: m[1] });
        last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });

    return parts.map((p, i) =>
        p.varName ? (
            <span key={i} style={varMap[p.varName].style}>
                {varMap[p.varName].value}
            </span>
        ) : (
            <span key={i}>{p.text}</span>
        ),
    );
}

// ─── Certificate renderers ────────────────────────────────────────────────────
interface CertProps {
    color: string;
    event: EventDetail | null;
    signers: CertificateSigner[];
    bodyNode?: React.ReactNode;
}

function DefaultCert({ color, event, signers, bodyNode }: CertProps) {
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
            <div style={{ height: 4, background: color, marginBottom: 32 }} />
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
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
                {bodyNode ? (
                    <div
                        style={{
                            fontSize: 16,
                            color: "#333",
                            lineHeight: 1.8,
                            fontFamily: '"DM Sans", sans-serif',
                            maxWidth: 420,
                            marginBottom: 24,
                        }}
                    >
                        {bodyNode}
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: 13, color: "#999", marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>
                            Certificamos que
                        </div>
                        <div style={{ fontSize: 38, fontWeight: "bold", color, marginBottom: 14, lineHeight: 1.2 }}>
                            Nome do Participante
                        </div>
                        <div style={{ fontSize: 13, color: "#999", marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>
                            participou do evento
                        </div>
                        <div style={{ fontSize: 20, fontWeight: "bold", color: "#1a1a2e", marginBottom: 10 }}>{title}</div>
                        <div style={{ fontSize: 13, color: "#666", marginBottom: hours ? 8 : 20, fontFamily: '"DM Sans", sans-serif' }}>
                            realizado em {date}
                        </div>
                        {hours && (
                            <div style={{ fontSize: 12, color: "#888", marginBottom: 20, fontFamily: '"DM Sans", sans-serif' }}>
                                com carga horária de {hours} horas
                            </div>
                        )}
                    </>
                )}
                <div style={{ fontSize: 9, color: "#ccc", fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.1em", marginTop: 12 }}>
                    CÓDIGO DE VALIDAÇÃO: ABC12345
                </div>
            </div>
            <div style={{ height: 1, background: color, opacity: 0.3, marginBottom: 24 }} />
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

function LandscapeCert({ color, event, signers, bodyNode }: CertProps) {
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
            }}
        >
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
                {bodyNode ? (
                    <div style={{ fontSize: 14, color: "#333", lineHeight: 1.85, fontFamily: '"DM Sans", sans-serif', marginBottom: 16 }}>
                        {bodyNode}
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: 11, color: "#999", marginBottom: 6, fontFamily: '"DM Sans", sans-serif' }}>
                            Certificamos que
                        </div>
                        <div style={{ fontSize: 30, fontWeight: "bold", color, marginBottom: 14, lineHeight: 1.2 }}>
                            Nome do Participante
                        </div>
                        <div style={{ fontSize: 11, color: "#999", marginBottom: 6, fontFamily: '"DM Sans", sans-serif' }}>
                            participou do evento
                        </div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: "#1a1a2e", marginBottom: 6 }}>{title}</div>
                        <div style={{ fontSize: 11, color: "#666", fontFamily: '"DM Sans", sans-serif' }}>
                            {date}
                            {hours ? ` · ${hours}h` : ""}
                        </div>
                    </>
                )}
                <div style={{ fontSize: 8, color: "#bbb", marginTop: 14, fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.08em" }}>
                    Código: ABC12345
                </div>
            </div>
            <div style={{ width: 1, background: color }} />
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

function MinimalistCert({ color, event, signers, bodyNode }: CertProps) {
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
            {bodyNode ? (
                <div
                    style={{
                        fontSize: 17,
                        color: "#333",
                        lineHeight: 1.9,
                        fontFamily: '"DM Sans", sans-serif',
                        maxWidth: 380,
                        marginBottom: 48,
                    }}
                >
                    {bodyNode}
                </div>
            ) : (
                <>
                    <div style={{ fontSize: 40, fontWeight: "bold", color: "#1a1a2e", marginBottom: 24, lineHeight: 1.2 }}>
                        Nome do Participante
                    </div>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 10, fontFamily: '"DM Sans", sans-serif' }}>participou de</div>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a2e", marginBottom: 12 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "#aaa", marginBottom: 60, fontFamily: '"DM Sans", sans-serif' }}>
                        {date}
                        {hours ? ` · ${hours} horas` : ""}
                    </div>
                </>
            )}
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

function NoirCert({ color, event, bodyNode }: CertProps) {
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
        : "1 de janeiro de 2026";

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
                        color,
                        textTransform: "uppercase",
                        fontFamily: '"DM Sans", sans-serif',
                        marginBottom: 20,
                    }}
                >
                    Certificado de Participação
                </div>
                {bodyNode ? (
                    <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.85, fontFamily: '"DM Sans", sans-serif', maxWidth: 420 }}>
                        {bodyNode}
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>
                            Certificamos que
                        </div>
                        <div style={{ fontSize: 34, fontWeight: "bold", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
                            Nome do Participante
                        </div>
                        <div style={{ width: 40, height: 2, background: color, marginBottom: 16 }} />
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "#e2e2e2" }}>{title}</div>
                        <div style={{ fontSize: 10, color: "#555", marginTop: 8, fontFamily: '"DM Sans", sans-serif' }}>{date}</div>
                    </>
                )}
            </div>
        </div>
    );
}

function GoldCert({ bodyNode, event }: CertProps) {
    const gold = "#C9A84C";
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
        : "1 de janeiro de 2026";

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
            {bodyNode ? (
                <div
                    style={{
                        fontSize: 16,
                        color: "#5A3E00",
                        lineHeight: 1.85,
                        fontFamily: '"DM Sans", sans-serif',
                        maxWidth: 380,
                        marginBottom: 40,
                    }}
                >
                    {bodyNode}
                </div>
            ) : (
                <>
                    <div style={{ fontSize: 38, fontWeight: "bold", color: "#2A1A00", marginBottom: 16, lineHeight: 1.2 }}>
                        Nome do Participante
                    </div>
                    <div style={{ width: 60, height: 1, background: gold, marginBottom: 16 }} />
                    <div style={{ fontSize: 15, color: "#5A3E00", marginBottom: 8 }}>{title}</div>
                    <div style={{ fontSize: 11, color: "#AA8840", fontFamily: '"DM Sans", sans-serif', marginBottom: 40 }}>{date}</div>
                </>
            )}
            <div style={{ width: "100%", height: 2, background: `linear-gradient(to right, transparent, ${gold}, transparent)` }} />
        </div>
    );
}

function EditorialCert({ color, event, bodyNode }: CertProps) {
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : "01 jan 2026";

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
                {bodyNode ? (
                    <div style={{ fontSize: 13, color: "#333", lineHeight: 1.85, fontFamily: '"DM Sans", sans-serif', marginBottom: 32 }}>
                        {bodyNode}
                    </div>
                ) : (
                    <>
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
                        <div style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a", marginBottom: 12, lineHeight: 1.3 }}>{title}</div>
                        <div style={{ fontSize: 11, color: "#666", fontFamily: '"DM Sans", sans-serif', marginBottom: 40 }}>{date}</div>
                    </>
                )}
                <div style={{ height: 1, background: "#ddd", marginBottom: 16 }} />
                <div style={{ fontSize: 9, color: "#ccc", fontFamily: '"DM Sans", sans-serif', letterSpacing: "0.1em" }}>ABC12345</div>
            </div>
        </div>
    );
}

function DiplomaCert({ color, event, bodyNode }: CertProps) {
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
        : "1 de janeiro de 2026";

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
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#1a1a2e", marginBottom: 12, letterSpacing: "0.05em" }}>
                    CERTIFICADO DE PARTICIPAÇÃO
                </div>
                <div style={{ width: 60, height: 1, background: color, margin: "0 auto 20px" }} />
                {bodyNode ? (
                    <div
                        style={{
                            fontSize: 14,
                            color: "#444",
                            lineHeight: 1.85,
                            fontFamily: '"DM Sans", sans-serif',
                            maxWidth: 460,
                            marginBottom: 16,
                        }}
                    >
                        {bodyNode}
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontFamily: '"DM Sans", sans-serif' }}>
                            Conferimos o presente diploma a
                        </div>
                        <div style={{ fontSize: 32, fontWeight: "bold", color, marginBottom: 8, lineHeight: 1.2, fontStyle: "italic" }}>
                            Nome do Participante
                        </div>
                        <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontFamily: '"DM Sans", sans-serif' }}>
                            por sua participação em
                        </div>
                        <div style={{ fontSize: 16, fontWeight: "bold", color: "#1a1a2e", marginBottom: 8 }}>{title}</div>
                        <div style={{ fontSize: 10, color: "#888", fontFamily: '"DM Sans", sans-serif' }}>{date}</div>
                    </>
                )}
            </div>
        </div>
    );
}

function WaveCert({ color, event, bodyNode }: CertProps) {
    const title = event?.title ?? "Nome do Evento";
    const date = event?.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : "01 jan 2026";

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
            <div style={{ flex: 1, padding: "40px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {bodyNode ? (
                    <div style={{ fontSize: 14, color: "#333", lineHeight: 1.85, marginBottom: 20 }}>{bodyNode}</div>
                ) : (
                    <>
                        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>participou do evento</div>
                        <div style={{ fontSize: 20, fontWeight: "700", color: "#1a1a2e", marginBottom: 10 }}>{title}</div>
                        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 32 }}>{date}</div>
                    </>
                )}
                <div style={{ fontSize: 8, color: "#ddd", letterSpacing: "0.12em" }}>CÓDIGO ABC12345</div>
            </div>
        </div>
    );
}

// ─── Cert dispatcher ──────────────────────────────────────────────────────────
function CertPreview(props: CertProps & { template: EditorTemplate }) {
    const { template, ...rest } = props;
    switch (template) {
        case "DEFAULT":
            return <DefaultCert {...rest} />;
        case "LANDSCAPE":
            return <LandscapeCert {...rest} />;
        case "MINIMALIST":
            return <MinimalistCert {...rest} />;
        case "NOIR":
            return <NoirCert {...rest} />;
        case "GOLD":
            return <GoldCert {...rest} />;
        case "EDITORIAL":
            return <EditorialCert {...rest} />;
        case "DIPLOMA":
            return <DiplomaCert {...rest} />;
        case "WAVE":
            return <WaveCert {...rest} />;
    }
}

// ─── Scaled wrapper (canvas preview) ─────────────────────────────────────────
function ScaledCert({
    template,
    color,
    event,
    signers,
    bodyNode,
    watermarkUrl,
    watermarkOpacity,
    scale,
    className,
}: CertProps & {
    template: EditorTemplate;
    scale: number;
    bodyNode?: React.ReactNode;
    watermarkUrl?: string | null;
    watermarkOpacity?: number;
    className?: string;
}) {
    const { w, h } = getCertDimensions(template);
    return (
        <div className={className} style={{ width: w * scale, height: h * scale, overflow: "hidden", flexShrink: 0, position: "relative" }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <CertPreview template={template} color={color} event={event} signers={signers} bodyNode={bodyNode} />
            </div>
            {watermarkUrl && (
                <img
                    src={watermarkUrl}
                    alt=""
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        opacity: watermarkOpacity ?? 0.1,
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                />
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
    eventId: string;
    event: EventDetail;
    signers: CertificateSigner[];
}

const MAX_PREVIEW_H = 640;

export function CertificateStudioTab({ eventId, event, signers }: Props) {
    const queryClient = useQueryClient();

    const [template, setTemplate] = useState<EditorTemplate>(() => (event.certificateTemplate as EditorTemplate) ?? "DEFAULT");
    const [color, setColor] = useState(event.primaryColor ?? "#5B21B6");
    const [watermarkUrl, setWatermarkUrl] = useState<string | null>(() => localStorage.getItem(`kora-wm-${eventId}`));
    const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => Number(localStorage.getItem(`kora-wm-op-${eventId}`)) || 0.1);
    const [bodyText, setBodyText] = useState<string>(() => localStorage.getItem(`kora-ct-${eventId}`) || DEFAULT_BODY);
    const [saved, setSaved] = useState(false);
    const [scale, setScale] = useState(0.6);

    const previewRef = useRef<HTMLDivElement>(null);
    const watermarkInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Scale from container dimensions, capped to keep preview height ≤ MAX_PREVIEW_H
    useEffect(() => {
        const compute = () => {
            if (!previewRef.current) return;
            const { w, h } = getCertDimensions(template);
            const pad = 48;
            const availW = previewRef.current.clientWidth - pad;
            setScale(Math.max(Math.min(availW / w, MAX_PREVIEW_H / h, 0.9), 0.3));
        };
        compute();
        const ro = new ResizeObserver(compute);
        if (previewRef.current) ro.observe(previewRef.current);
        return () => ro.disconnect();
    }, [template]);

    const mutation = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: () =>
            eventsService.updateEvent(eventId, {
                primaryColor: color,
                certificateTemplate: ["DEFAULT", "LANDSCAPE", "MINIMALIST"].includes(template)
                    ? (template as CertificateTemplate)
                    : undefined,
            } as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            if (watermarkUrl) localStorage.setItem(`kora-wm-${eventId}`, watermarkUrl);
            else localStorage.removeItem(`kora-wm-${eventId}`);
            localStorage.setItem(`kora-wm-op-${eventId}`, String(watermarkOpacity));
            localStorage.setItem(`kora-ct-${eventId}`, bodyText);
            toast.success("Configurações salvas!");
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        },
        onError: () => toast.error("Erro ao salvar."),
    });

    const handleWatermarkFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setWatermarkUrl(ev.target?.result as string);
        reader.readAsDataURL(file);
        if (watermarkInputRef.current) watermarkInputRef.current.value = "";
    }, []);

    const insertVariable = useCallback((varKey: string) => {
        const ta = textareaRef.current;
        if (!ta) {
            setBodyText((p) => p + varKey);
            return;
        }
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        setBodyText((p) => p.slice(0, start) + varKey + p.slice(end));
        setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(start + varKey.length, start + varKey.length);
        }, 0);
    }, []);

    const handlePreviewPDF = useCallback(() => {
        const el = printRef.current;
        if (!el) return;
        const info = TEMPLATES.find((t) => t.id === template);
        const { w, h } = getCertDimensions(template);
        const isLandscape = info?.orientation === "landscape";

        const win = window.open("", "_blank");
        if (!win) {
            toast.error("Permita pop-ups para abrir o preview.");
            return;
        }

        win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Preview — ${event.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #e8e8e6; display: flex; align-items: flex-start; justify-content: center; min-height: 100vh; padding: 40px; }
    @media print {
      @page { size: ${isLandscape ? "landscape" : "portrait"}; margin: 0; }
      html, body { background: white; padding: 0; min-height: auto; }
    }
  </style>
</head>
<body>
  <div style="position:relative;display:inline-block;width:${w}px;height:${h}px;">
    ${el.innerHTML}
  </div>
</body>
</html>`);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 1800);
    }, [event.title, template]);

    // Build preview body node
    const previewDate = event.startDate
        ? new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
        : "1 de janeiro de 2026";
    const previewHours = event.workloadHours ? `${event.workloadHours} horas` : null;
    const bodyNode = bodyText.trim() ? parseBodyText(bodyText, color, event.title, previewDate, previewHours) : undefined;

    const { h: certH } = getCertDimensions(template);
    const previewH = Math.min(Math.round(certH * scale) + 56, MAX_PREVIEW_H + 56);

    return (
        <div className="space-y-5">
            {/* ── Template row ──────────────────────────────────────────────── */}
            <div className="flex gap-4 overflow-x-auto pt-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                {TEMPLATES.map((t) => {
                    const { w, h } = getCertDimensions(t.id);
                    const tw = 96;
                    const th = Math.round((h / w) * tw);
                    const ts = tw / w;
                    const sel = template === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => {
                                if (t.pro) {
                                    toast("Disponível no plano Pro");
                                    return;
                                }
                                setTemplate(t.id);
                            }}
                            className={cn(
                                "relative shrink-0 flex-col text-center flex gap-1.5 transition-all duration-200 cursor-pointer",
                                sel ? "opacity-100" : "opacity-45 hover:opacity-75",
                            )}
                        >
                            <div
                                className="relative rounded-lg overflow-hidden transition-all duration-200"
                                style={{
                                    width: tw,
                                    height: th,
                                    boxShadow: sel
                                        ? `0 0 0 2.5px ${color}, 0 0 0 5px ${color}1a, 0 4px 16px ${color}33`
                                        : "0 0 0 1px var(--color-border)",
                                }}
                            >
                                <div style={{ width: tw, height: th, overflow: "hidden" }}>
                                    <div style={{ transform: `scale(${ts})`, transformOrigin: "top left" }}>
                                        <CertPreview template={t.id} color={color} event={event} signers={signers} />
                                    </div>
                                </div>
                                {t.pro && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-yellow-300 bg-yellow-400/20 border border-yellow-400/30">
                                            <Lock className="h-2 w-2" /> PRO
                                        </span>
                                    </div>
                                )}
                            </div>
                            <span className="text-[11px] font-medium text-text-muted leading-none">{t.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Studio layout ─────────────────────────────────────────────── */}
            <div className="flex gap-5 items-start">
                {/* Left: canvas */}
                <div
                    ref={previewRef}
                    className="relative rounded-2xl overflow-hidden flex items-center justify-center flex-1"
                    style={{ background: "#0c0a14", minHeight: 400, height: previewH }}
                >
                    {/* Fine dot grid */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    {/* Radial vignette */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)" }}
                    />

                    {/* Certificate */}
                    <div
                        className="relative z-10"
                        style={{ filter: "drop-shadow(0 28px 72px rgba(0,0,0,0.9)) drop-shadow(0 6px 24px rgba(0,0,0,0.7))" }}
                    >
                        <ScaledCert
                            template={template}
                            color={color}
                            event={event}
                            signers={signers}
                            bodyNode={bodyNode}
                            watermarkUrl={watermarkUrl}
                            watermarkOpacity={watermarkOpacity}
                            scale={scale}
                        />
                    </div>

                    {/* Bottom bar */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-between px-5">
                        <span className="text-[10px] font-mono text-white/25">
                            {TEMPLATES.find((t) => t.id === template)?.orientation === "landscape" ? "297 × 210 mm" : "210 × 297 mm"} ·{" "}
                            {Math.round(scale * 100)}%
                        </span>
                        <Link
                            to={`/events/${eventId}/certificate-editor`}
                            className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                        >
                            <ExternalLink className="h-2.5 w-2.5" />
                            Abrir editor completo
                        </Link>
                    </div>
                </div>

                {/* Right: controls */}
                <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: 288 }}>
                    {/* Color */}
                    <section className="rounded-xl border border-border bg-bg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Palette className="h-3.5 w-3.5 text-text-muted" />
                            <p className="text-[10px] font-bold tracking-[0.12em] text-text-muted uppercase">Cor principal</p>
                        </div>
                        <div className="grid grid-cols-6 gap-1.5">
                            {COLOR_PRESETS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "h-7 w-7 rounded-md transition-all duration-150 hover:scale-110 cursor-pointer",
                                        color === c ? "ring-2 ring-offset-1 ring-text/60" : "",
                                    )}
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-7 w-7 rounded-md flex-shrink-0 border border-border shadow-inner"
                                style={{ background: color }}
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => {
                                    const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
                                    if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v);
                                }}
                                className="flex-1 h-8 border border-border bg-bg-muted rounded-lg px-2.5 text-xs font-mono text-text outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                                placeholder="#5B21B6"
                            />
                        </div>
                    </section>

                    {/* Watermark */}
                    <section className="rounded-xl border border-border bg-bg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-3.5 w-3.5 text-text-muted" />
                            <p className="text-[10px] font-bold tracking-[0.12em] text-text-muted uppercase">Marca d'água</p>
                        </div>
                        <input ref={watermarkInputRef} type="file" accept="image/*" className="hidden" onChange={handleWatermarkFile} />
                        {watermarkUrl ? (
                            <div className="space-y-3">
                                <div
                                    className="relative rounded-lg border border-border overflow-hidden"
                                    style={{
                                        height: 80,
                                        backgroundImage:
                                            "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
                                        backgroundSize: "8px 8px",
                                        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
                                    }}
                                >
                                    <img
                                        src={watermarkUrl}
                                        alt="Marca d'água"
                                        className="absolute inset-0 w-full h-full object-contain"
                                        style={{ opacity: Math.min(watermarkOpacity * 3.5 + 0.15, 1) }}
                                    />
                                    <button
                                        onClick={() => setWatermarkUrl(null)}
                                        className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-bg border border-border flex items-center justify-center text-text-muted hover:text-danger transition-colors shadow-sm cursor-pointer z-10"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-[10px] text-text-muted">Opacidade no certificado</span>
                                        <span className="text-[10px] font-mono text-text-muted">{Math.round(watermarkOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0.02}
                                        max={0.5}
                                        step={0.01}
                                        value={watermarkOpacity}
                                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                        className="w-full h-1 rounded-full appearance-none cursor-pointer"
                                        style={{ accentColor: color }}
                                    />
                                </div>
                                <button
                                    onClick={() => watermarkInputRef.current?.click()}
                                    className="w-full text-[11px] text-text-muted hover:text-text border border-dashed border-border rounded-lg py-2 transition-all hover:bg-bg-muted cursor-pointer"
                                >
                                    Trocar imagem
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => watermarkInputRef.current?.click()}
                                className="w-full flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed border-border text-text-muted hover:text-text hover:bg-bg-muted transition-all duration-200 cursor-pointer group"
                            >
                                <Upload className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                <span className="text-xs">Carregar imagem</span>
                                <span className="text-[10px] text-text-disabled">PNG · SVG · JPEG</span>
                            </button>
                        )}
                    </section>

                    {/* Text editor */}
                    <section className="rounded-xl border border-border bg-bg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Type className="h-3.5 w-3.5 text-text-muted" />
                            <p className="text-[10px] font-bold tracking-[0.12em] text-text-muted uppercase">Texto do certificado</p>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            rows={4}
                            placeholder="Escreva o texto e insira variáveis com os botões abaixo."
                            className="w-full resize-none rounded-lg border border-border bg-bg-muted px-3 py-2.5 text-[11px] text-text placeholder:text-text-disabled outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors leading-relaxed font-mono"
                        />
                        <div className="space-y-2">
                            <p className="text-[10px] text-text-disabled">Clique para inserir no cursor:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {VARIABLES.map((v) => (
                                    <button
                                        key={v.key}
                                        onClick={() => insertVariable(v.key)}
                                        title={v.label}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-mono border transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                                        style={{ background: `${color}0d`, borderColor: `${color}33`, color }}
                                    >
                                        {v.key}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Pro upsell */}
                    <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <p className="text-[10px] font-semibold text-amber-700">Pro — em breve</p>
                        </div>
                        <p className="text-[10px] text-amber-600/80 leading-relaxed">
                            Posicionamento livre de campos, 8 templates premium, exportação em alta resolução.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handlePreviewPDF} className="flex-1 gap-1.5 text-xs" size="sm">
                            <FileDown className="h-3.5 w-3.5" />
                            Preview PDF
                        </Button>
                        <Button
                            onClick={() => mutation.mutate()}
                            disabled={mutation.isPending || saved}
                            className="flex-1 gap-1.5 text-xs"
                            size="sm"
                        >
                            {saved ? (
                                <>
                                    <Check className="h-3.5 w-3.5" /> Salvo
                                </>
                            ) : mutation.isPending ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Salvando…
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" /> Salvar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hidden full-size cert for PDF printing */}
            <div
                ref={printRef}
                aria-hidden="true"
                style={{ position: "fixed", top: "-99999px", left: "-99999px", overflow: "visible", pointerEvents: "none" }}
            >
                <div style={{ position: "relative", display: "inline-block" }}>
                    <CertPreview template={template} color={color} event={event} signers={signers} bodyNode={bodyNode} />
                    {watermarkUrl && (
                        <img
                            src={watermarkUrl}
                            alt=""
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                opacity: watermarkOpacity,
                                pointerEvents: "none",
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
