import { useState, useCallback, useEffect, useRef } from "react";
import { registerPushToken } from "@/services/pushNotifications";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    WifiOff,
    RefreshCw,
    Users,
    Clock,
    XCircle,
    Loader2,
    QrCode,
    KeyRound,
    UserSearch,
    ClipboardList,
    Download,
    ScanFace,
} from "lucide-react";
import { toast } from "sonner";
import { QrScanner } from "@/components/QrScanner";
import { useCheckinQueue } from "@/hooks/useCheckinQueue";
import { useCheckinStats } from "@/hooks/useCheckinStats";
import { useEvent } from "@/hooks/useEvent";
import { performCheckin, performCheckinByCpf, performCheckinByName, getAuditLog, exportInstitutional } from "@/services/checkin";
import type { CheckinResult, ManualCheckinLog } from "@/services/checkin";

type ScanStatus = "idle" | "loading" | "success" | "already" | "error" | "queued";

interface ScanState {
    status: ScanStatus;
    result?: CheckinResult;
    message?: string;
}

const RESULT_CONFIG = {
    success: {
        bg: "linear-gradient(135deg, #052e16, #14532d)",
        border: "#22c55e40",
        icon: CheckCircle2,
        iconColor: "#4ade80",
        label: "Check-in realizado",
        glow: "0 0 40px #16a34a40",
    },
    already: {
        bg: "linear-gradient(135deg, #431407, #7c2d12)",
        border: "#f9731640",
        icon: AlertCircle,
        iconColor: "#fb923c",
        label: "Já fez check-in",
        glow: "0 0 40px #ea580c30",
    },
    error: {
        bg: "linear-gradient(135deg, #450a0a, #7f1d1d)",
        border: "#ef444440",
        icon: XCircle,
        iconColor: "#f87171",
        label: "Token inválido",
        glow: "0 0 40px #dc262640",
    },
    queued: {
        bg: "linear-gradient(135deg, #1c1917, #292524)",
        border: "#fbbf2440",
        icon: WifiOff,
        iconColor: "#fbbf24",
        label: "Salvo offline",
        glow: "0 0 40px #d9770630",
    },
    loading: {
        bg: "linear-gradient(135deg, #0f0d18, #1e1c2c)",
        border: "#7c3aed40",
        icon: Loader2,
        iconColor: "#a78bfa",
        label: "Verificando...",
        glow: "0 0 40px #7c3aed20",
    },
    idle: null,
} as const;

type Mode = "qr" | "cpf" | "name" | "secretary" | "facial";

function FacialCheckinView() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [streamActive, setStreamActive] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" } })
            .then((s) => {
                stream = s;
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                    setStreamActive(true);
                }
            })
            .catch(() => setCameraError("Câmera não disponível ou permissão negada"));

        return () => {
            stream?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-5 px-4">
            <div className="relative w-64 h-64 rounded-3xl overflow-hidden" style={{ border: "2px solid rgba(139,92,246,0.5)" }}>
                {cameraError ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                        <ScanFace size={32} style={{ color: "rgba(255,255,255,0.2)" }} />
                        <p className="text-xs text-white/40">{cameraError}</p>
                    </div>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                        {/* Face oval guide */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
                                <ellipse
                                    cx="80"
                                    cy="100"
                                    rx="68"
                                    ry="88"
                                    stroke={isProcessing ? "#a78bfa" : "rgba(255,255,255,0.5)"}
                                    strokeWidth="2"
                                    strokeDasharray={isProcessing ? "8 4" : "none"}
                                    style={{ transition: "stroke 0.3s" }}
                                />
                            </svg>
                        </div>
                        {/* Scan line */}
                        {streamActive && !isProcessing && (
                            <div
                                className="absolute left-0 right-0 h-0.5 pointer-events-none"
                                style={{
                                    background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)",
                                    animation: "facialScan 2s ease-in-out infinite",
                                }}
                            />
                        )}
                    </>
                )}
            </div>

            <p className="text-sm text-white/50 text-center max-w-[240px]">
                {isProcessing
                    ? "Identificando participante..."
                    : cameraError
                      ? "Verifique as permissões da câmera"
                      : "Posicione o rosto dentro da moldura"}
            </p>

            {streamActive && !cameraError && (
                <button
                    disabled={isProcessing}
                    onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => setIsProcessing(false), 2500);
                    }}
                    className="rounded-2xl px-8 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #5B21B6, #7C3AED)" }}
                >
                    {isProcessing ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Identificar"}
                </button>
            )}

            <p className="text-xs text-white/25 text-center max-w-[220px]">
                Reconhecimento facial está em beta. Requer integração com API biométrica.
            </p>

            <style>{`
                @keyframes facialScan {
                    0% { top: 12px; opacity: 0.3; }
                    50% { top: calc(100% - 12px); opacity: 1; }
                    100% { top: 12px; opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}

export function CheckinScannerPage() {
    const { eventId = "" } = useParams<{ eventId: string }>();
    const { event, isLoading: eventLoading } = useEvent(eventId);
    const { stats, refetch: refetchStats } = useCheckinStats(eventId);
    const { queueCount, isSyncing, isOnline, addToQueue, sync } = useCheckinQueue();
    const [scan, setScan] = useState<ScanState>({ status: "idle" });
    const [mode, setMode] = useState<Mode>("qr");
    const [cpfInput, setCpfInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const cpfRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // Register FCM push token when PWA is available
    useEffect(() => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        Notification.requestPermission().then(async (permission) => {
            if (permission !== "granted") return;
            try {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.getSubscription();
                if (sub) {
                    await registerPushToken(JSON.stringify(sub.endpoint));
                }
            } catch {
                // Push registration is best-effort
            }
        });
    }, []);

    // Secretary mode state
    const [secSearchType, setSecSearchType] = useState<"cpf" | "name">("cpf");
    const [secInput, setSecInput] = useState("");
    const [secJustification, setSecJustification] = useState("");
    const [auditLog, setAuditLog] = useState<ManualCheckinLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleScan = useCallback(
        async (token: string) => {
            setScan({ status: "loading" });

            if (!isOnline) {
                await addToQueue(token);
                setScan({ status: "queued", message: "Será sincronizado quando a conexão voltar" });
                setTimeout(() => setScan({ status: "idle" }), 3000);
                return;
            }

            try {
                const result = await performCheckin(token);
                setScan({ status: "success", result });
                refetchStats();
                setTimeout(() => setScan({ status: "idle" }), 3500);
            } catch (err: unknown) {
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 409) {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Já fez check-in";
                    setScan({ status: "already", message: msg });
                } else {
                    setScan({ status: "error", message: "Token não encontrado" });
                }
                setTimeout(() => setScan({ status: "idle" }), 3000);
            }
        },
        [isOnline, addToQueue, refetchStats],
    );

    const handleNameCheckin = useCallback(async () => {
        if (!nameInput.trim() || scan.status === "loading") return;
        setScan({ status: "loading" });
        try {
            const result = await performCheckinByName(nameInput.trim(), eventId);
            setScan({ status: "success", result });
            setNameInput("");
            refetchStats();
            setTimeout(() => setScan({ status: "idle" }), 3500);
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            if (status === 409) {
                setScan({ status: "already", message: msg ?? "Já fez check-in" });
            } else if (status === 400) {
                setScan({ status: "error", message: msg ?? "Nome ambíguo — seja mais específico" });
            } else {
                setScan({ status: "error", message: "Participante não encontrado" });
            }
            setTimeout(() => setScan({ status: "idle" }), 3500);
        }
    }, [nameInput, eventId, scan.status, refetchStats]);

    const handleCpfCheckin = useCallback(async () => {
        if (!cpfInput || scan.status === "loading") return;
        setScan({ status: "loading" });
        try {
            const result = await performCheckinByCpf(cpfInput, eventId);
            setScan({ status: "success", result });
            setCpfInput("");
            refetchStats();
            setTimeout(() => setScan({ status: "idle" }), 3500);
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Já fez check-in";
                setScan({ status: "already", message: msg });
            } else {
                setScan({ status: "error", message: "CPF não encontrado neste evento" });
            }
            setTimeout(() => setScan({ status: "idle" }), 3000);
        }
    }, [cpfInput, eventId, scan.status, refetchStats]);

    const fetchAuditLog = useCallback(async () => {
        if (!eventId) return;
        setAuditLoading(true);
        try {
            const logs = await getAuditLog(eventId);
            setAuditLog(logs);
        } catch {
            // silently ignore — non-critical
        } finally {
            setAuditLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        if (mode === "secretary") {
            fetchAuditLog();
        }
    }, [mode, fetchAuditLog]);

    const handleSecretaryCheckin = useCallback(async () => {
        if (!secInput.trim() || scan.status === "loading") return;

        if (!secJustification.trim()) {
            toast.error("Justificativa obrigatória no modo secretaria");
            return;
        }

        setScan({ status: "loading" });
        try {
            const result =
                secSearchType === "cpf"
                    ? await performCheckinByCpf(secInput, eventId)
                    : await performCheckinByName(secInput.trim(), eventId);
            setScan({ status: "success", result });
            setSecInput("");
            setSecJustification("");
            refetchStats();
            fetchAuditLog();
            setTimeout(() => setScan({ status: "idle" }), 3500);
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            if (status === 409) {
                setScan({ status: "already", message: msg ?? "Já fez check-in" });
            } else if (status === 400) {
                setScan({ status: "error", message: msg ?? "Busca ambígua — seja mais específico" });
            } else {
                setScan({ status: "error", message: "Participante não encontrado" });
            }
            setTimeout(() => setScan({ status: "idle" }), 3500);
        }
    }, [secInput, secJustification, secSearchType, eventId, scan.status, refetchStats, fetchAuditLog]);

    const handleExportInstitutional = useCallback(async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            await exportInstitutional(eventId, event?.title ?? "");
        } catch {
            toast.error("Erro ao exportar lista institucional");
        } finally {
            setIsExporting(false);
        }
    }, [eventId, event?.title, isExporting]);

    const formatCpfInput = (value: string): string => {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    };

    const pct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

    const config = scan.status !== "idle" ? RESULT_CONFIG[scan.status] : null;
    const IconComponent = config?.icon;

    useEffect(() => {
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.documentElement.style.overflow = "";
        };
    }, []);

    return (
        <div
            className="relative flex h-dvh flex-col overflow-hidden"
            style={{ background: "#0D0B18", fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
            {/* Camera — full background, only in QR mode */}
            <div className="absolute inset-0">
                <QrScanner onScan={handleScan} active={mode === "qr" && scan.status === "idle"} />
            </div>

            {/* Dark vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(13,11,24,0.75) 100%)",
                }}
            />

            {/* Top overlay — header */}
            <div
                className="relative z-10 flex items-center justify-between px-4 py-4"
                style={{ background: "linear-gradient(to bottom, rgba(13,11,24,0.95), transparent)" }}
            >
                <Link
                    to="/checkin"
                    className="flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Eventos
                </Link>

                <div className="flex items-center gap-2">
                    {/* Mode toggle */}
                    <div className="flex items-center rounded-full bg-white/8 p-0.5">
                        {(
                            [
                                { id: "qr", label: "QR", icon: QrCode },
                                { id: "cpf", label: "CPF", icon: KeyRound },
                                { id: "name", label: "Nome", icon: UserSearch },
                                { id: "secretary", label: "Secretaria", icon: ClipboardList },
                                { id: "facial", label: "Facial", icon: ScanFace },
                            ] as const
                        ).map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setMode(id);
                                    setScan({ status: "idle" });
                                    setTimeout(() => {
                                        if (id === "cpf") cpfRef.current?.focus();
                                        if (id === "name") nameRef.current?.focus();
                                    }, 100);
                                }}
                                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
                                style={{
                                    background: mode === id ? "rgba(124,58,237,0.7)" : "transparent",
                                    color: mode === id ? "#fff" : "rgba(255,255,255,0.4)",
                                }}
                            >
                                <Icon size={11} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {queueCount > 0 && (
                        <button
                            onClick={() => sync()}
                            disabled={!isOnline || isSyncing}
                            className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-400/25 disabled:opacity-50"
                        >
                            <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
                            {queueCount} offline
                        </button>
                    )}
                    <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                            background: isOnline ? "#16a34a18" : "#dc262618",
                            color: isOnline ? "#4ade80" : "#f87171",
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: isOnline ? "#4ade80" : "#f87171" }} />
                        {isOnline ? "Online" : "Offline"}
                    </span>
                </div>
            </div>

            {/* Event name */}
            {!eventLoading && event && (
                <div className="relative z-10 px-4 pb-2">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-violet-400">{event.title}</p>
                </div>
            )}

            {/* Viewfinder — center overlay */}
            <div className="relative z-10 flex flex-1 items-center justify-center">
                {mode === "qr" ? (
                    <div className="relative" style={{ width: 220, height: 220 }}>
                        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                            <svg
                                key={corner}
                                className="absolute"
                                width={36}
                                height={36}
                                style={{
                                    top: corner.startsWith("t") ? 0 : "auto",
                                    bottom: corner.startsWith("b") ? 0 : "auto",
                                    left: corner.endsWith("l") ? 0 : "auto",
                                    right: corner.endsWith("r") ? 0 : "auto",
                                    transform: `rotate(${{ tl: 0, tr: 90, bl: 270, br: 180 }[corner]}deg)`,
                                }}
                            >
                                <path
                                    d="M4 32 L4 4 L32 4"
                                    fill="none"
                                    stroke={scan.status === "success" ? "#4ade80" : "#7c3aed"}
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    style={{ transition: "stroke 0.3s" }}
                                />
                            </svg>
                        ))}
                        {scan.status === "idle" && (
                            <div
                                className="absolute left-3 right-3"
                                style={{
                                    height: 2,
                                    background: "linear-gradient(to right, transparent, #7c3aed, #a78bfa, #7c3aed, transparent)",
                                    boxShadow: "0 0 8px #7c3aed80",
                                    animation: "scanLine 2s ease-in-out infinite",
                                }}
                            />
                        )}
                        {scan.status === "loading" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-violet-400" />
                            </div>
                        )}
                    </div>
                ) : mode === "cpf" ? (
                    <div className="w-full max-w-xs px-6 flex flex-col items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
                        >
                            <KeyRound size={22} className="text-violet-400" />
                        </div>
                        <p className="text-sm text-white/50 text-center">Digite o CPF do participante</p>
                        <input
                            ref={cpfRef}
                            type="text"
                            inputMode="numeric"
                            placeholder="000.000.000-00"
                            value={cpfInput}
                            onChange={(e) => setCpfInput(formatCpfInput(e.target.value))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCpfCheckin();
                            }}
                            disabled={scan.status === "loading"}
                            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-center text-lg font-mono tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                        />
                        <button
                            onClick={handleCpfCheckin}
                            disabled={scan.status === "loading" || cpfInput.replace(/\D/g, "").length < 11}
                            className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg, #5B21B6, #7C3AED)" }}
                        >
                            {scan.status === "loading" ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Fazer Check-in"}
                        </button>
                    </div>
                ) : mode === "name" ? (
                    <div className="w-full max-w-xs px-6 flex flex-col items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
                        >
                            <UserSearch size={22} className="text-violet-400" />
                        </div>
                        <p className="text-sm text-white/50 text-center">Digite o nome do participante</p>
                        <input
                            ref={nameRef}
                            type="text"
                            placeholder="Ex: João Silva"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleNameCheckin();
                            }}
                            disabled={scan.status === "loading"}
                            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-center text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                        />
                        <button
                            onClick={handleNameCheckin}
                            disabled={scan.status === "loading" || nameInput.trim().length < 3}
                            className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg, #5B21B6, #7C3AED)" }}
                        >
                            {scan.status === "loading" ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Fazer Check-in"}
                        </button>
                    </div>
                ) : mode === "secretary" ? (
                    /* Secretary mode */
                    <div className="w-full px-4 flex flex-col gap-4 overflow-y-auto max-h-full pb-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)" }}
                                >
                                    <ClipboardList size={16} className="text-violet-400" />
                                </div>
                                <span className="text-sm font-semibold text-white">Modo Secretaria</span>
                            </div>
                            <button
                                onClick={handleExportInstitutional}
                                disabled={isExporting}
                                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-violet-300 transition-all hover:text-violet-200 disabled:opacity-50"
                                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
                            >
                                {isExporting ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                                Exportar lista institucional
                            </button>
                        </div>

                        {/* Search type toggle */}
                        <div className="flex rounded-xl bg-white/5 p-0.5 gap-0.5">
                            <button
                                onClick={() => {
                                    setSecSearchType("cpf");
                                    setSecInput("");
                                }}
                                className="flex-1 rounded-[10px] py-2 text-xs font-medium transition-all"
                                style={{
                                    background: secSearchType === "cpf" ? "rgba(124,58,237,0.6)" : "transparent",
                                    color: secSearchType === "cpf" ? "#fff" : "rgba(255,255,255,0.4)",
                                }}
                            >
                                Buscar por CPF
                            </button>
                            <button
                                onClick={() => {
                                    setSecSearchType("name");
                                    setSecInput("");
                                }}
                                className="flex-1 rounded-[10px] py-2 text-xs font-medium transition-all"
                                style={{
                                    background: secSearchType === "name" ? "rgba(124,58,237,0.6)" : "transparent",
                                    color: secSearchType === "name" ? "#fff" : "rgba(255,255,255,0.4)",
                                }}
                            >
                                Buscar por Nome
                            </button>
                        </div>

                        {/* Search input */}
                        <input
                            type="text"
                            inputMode={secSearchType === "cpf" ? "numeric" : "text"}
                            placeholder={secSearchType === "cpf" ? "000.000.000-00" : "Ex: João Silva"}
                            value={secInput}
                            onChange={(e) => setSecInput(secSearchType === "cpf" ? formatCpfInput(e.target.value) : e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSecretaryCheckin();
                            }}
                            disabled={scan.status === "loading"}
                            className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-center text-base font-mono tracking-wider text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                        />

                        {/* Justification */}
                        <textarea
                            placeholder="Ex: participante sem acesso ao QR code"
                            value={secJustification}
                            onChange={(e) => setSecJustification(e.target.value)}
                            disabled={scan.status === "loading"}
                            rows={2}
                            className="w-full resize-none rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                        />
                        <p className="text-xs -mt-2" style={{ color: "#9ca3af" }}>
                            Motivo do check-in manual (obrigatório)
                        </p>

                        {/* Submit */}
                        <button
                            onClick={handleSecretaryCheckin}
                            disabled={
                                scan.status === "loading" ||
                                (secSearchType === "cpf" ? secInput.replace(/\D/g, "").length < 11 : secInput.trim().length < 3)
                            }
                            className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg, #5B21B6, #7C3AED)" }}
                        >
                            {scan.status === "loading" ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Fazer Check-in"}
                        </button>

                        {/* Audit log */}
                        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Últimos registros</p>
                                {auditLoading && <Loader2 size={12} className="animate-spin text-white/30" />}
                                {!auditLoading && (
                                    <button
                                        onClick={fetchAuditLog}
                                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                    >
                                        Atualizar
                                    </button>
                                )}
                            </div>

                            {auditLog.length === 0 && !auditLoading ? (
                                <p className="text-xs text-center py-4" style={{ color: "#9ca3af" }}>
                                    Nenhum registro encontrado
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {auditLog.slice(0, 10).map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="rounded-lg px-3 py-2.5"
                                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-white truncate flex-1">
                                                    {entry.participantName}
                                                </span>
                                                <span
                                                    className="text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0"
                                                    style={{
                                                        background:
                                                            entry.method === "QR"
                                                                ? "rgba(59,130,246,0.2)"
                                                                : entry.method === "CPF"
                                                                  ? "rgba(139,92,246,0.2)"
                                                                  : "rgba(245,158,11,0.2)",
                                                        color:
                                                            entry.method === "QR"
                                                                ? "#93c5fd"
                                                                : entry.method === "CPF"
                                                                  ? "#c4b5fd"
                                                                  : "#fcd34d",
                                                    }}
                                                >
                                                    {entry.method}
                                                </span>
                                                <span className="text-[10px] shrink-0" style={{ color: "#9ca3af" }}>
                                                    {new Date(entry.createdAt).toLocaleTimeString("pt-BR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                            {entry.justification && (
                                                <p className="text-[11px] italic" style={{ color: "#9ca3af" }}>
                                                    {entry.justification}
                                                </p>
                                            )}
                                            {entry.operatorName && (
                                                <p className="text-[10px] mt-0.5" style={{ color: "rgba(156,163,175,0.6)" }}>
                                                    por {entry.operatorName}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : mode === "facial" ? (
                    <FacialCheckinView />
                ) : null}

                <style>{`
          @keyframes scanLine {
            0%   { top: 12px; opacity: 0.4; }
            50%  { top: 208px; opacity: 1; }
            100% { top: 12px; opacity: 0.4; }
          }
        `}</style>
            </div>

            {/* Bottom panel */}
            <div
                className="relative z-10 flex flex-col gap-3 px-4 pb-6 pt-4"
                style={{ background: "linear-gradient(to top, rgba(13,11,24,0.98) 60%, transparent)" }}
            >
                {/* Result card */}
                {config && (
                    <div
                        className="rounded-2xl border p-4"
                        style={{
                            background: config.bg,
                            borderColor: config.border,
                            boxShadow: config.glow,
                            animation: "resultIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                    >
                        <div className="flex items-start gap-3">
                            {IconComponent && (
                                <IconComponent
                                    size={22}
                                    className={scan.status === "loading" ? "animate-spin" : ""}
                                    style={{ color: config.iconColor, marginTop: 1, flexShrink: 0 }}
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.iconColor }}>
                                    {config.label}
                                </p>
                                {scan.result ? (
                                    <>
                                        <p className="mt-0.5 text-base font-bold text-white">{scan.result.name}</p>
                                        <p className="text-xs text-white/50">{scan.result.email}</p>
                                        {scan.status === "success" && (
                                            <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                                                <Clock size={10} />
                                                {new Date(scan.result.checkedInAt).toLocaleTimeString("pt-BR", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        )}
                                    </>
                                ) : scan.message ? (
                                    <p className="mt-0.5 text-sm text-white/70">{scan.message}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats bar */}
                <div className="rounded-xl border border-white/6 bg-white/3 p-3.5">
                    <div className="mb-2.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                            <Users size={12} />
                            Progresso
                        </span>
                        <span className="text-xs font-bold" style={{ color: pct === 100 ? "#4ade80" : "#a78bfa" }}>
                            {pct}%
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${pct}%`,
                                background: "linear-gradient(to right, #5B21B6, #7C3AED, #A78BFA)",
                                boxShadow: "0 0 8px #7c3aed60",
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-xl font-bold text-white">{stats.checkedIn}</p>
                            <p className="text-xs text-emerald-400/80">✓ confirmados</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.pending}</p>
                            <p className="text-xs text-white/40">⏳ pendentes</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">{stats.total}</p>
                            <p className="text-xs text-white/30">total</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-white/20">
                    {mode === "qr"
                        ? "Aponte a câmera para o QR code do participante"
                        : mode === "name"
                          ? "Mínimo 3 caracteres — nome ambíguo retorna erro"
                          : mode === "secretary"
                            ? "Justificativa obrigatória para check-in manual"
                            : mode === "facial"
                              ? "Posicione o rosto dentro da moldura para identificação"
                              : 'Pressione Enter ou toque em "Fazer Check-in"'}
                </p>
            </div>

            <style>{`
        @keyframes resultIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
}
