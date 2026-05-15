import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { CheckCircle2, Calendar, Mail, User, ArrowLeft, Share2, Award, Bell, XCircle, Megaphone, ArrowRightLeft, BellRing } from "lucide-react";
import { toast } from "sonner";
import { usePublicEvent } from "@/hooks/usePublicEvent";
import type { RegisterResult } from "@/services/public";
import { api } from "@/lib/api";
import { type Notification, getParticipantNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications";
import { initiateTransfer } from "@/services/transfers";
import { registerPushToken } from "@/services/pushNotifications";

const STATUS_LABELS: Record<string, string> = {
    CONFIRMED: "Confirmada",
    PENDING: "Pendente de aprovação",
    WAITLISTED: "Lista de espera",
};

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "agora mesmo";
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} hora${hours > 1 ? "s" : ""}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `há ${days} dia${days > 1 ? "s" : ""}`;
    const weeks = Math.floor(days / 7);
    return `há ${weeks} semana${weeks > 1 ? "s" : ""}`;
}

function NotificationIcon({ type }: { type: string }) {
    switch (type) {
        case "CONFIRMATION":
        case "APPROVAL":
            return <CheckCircle2 className="h-4 w-4 shrink-0" />;
        case "REJECTION":
            return <XCircle className="h-4 w-4 shrink-0 text-red-500" />;
        case "CERTIFICATE":
            return <Award className="h-4 w-4 shrink-0" />;
        case "BROADCAST":
            return <Megaphone className="h-4 w-4 shrink-0" />;
        default:
            return <Bell className="h-4 w-4 shrink-0" />;
    }
}

export function ConfirmationPage() {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const registration = (location.state as { registration?: RegisterResult } | null)?.registration;
    const { event } = usePublicEvent(slug ?? "");

    const primaryColor = event?.primaryColor ?? "#5B21B6";
    const rgb = hexToRgb(primaryColor);

    const isCertificateEligible =
        registration != null &&
        event != null &&
        ((registration.checkedInAt != null && new Date(event.endDate) < new Date()) || registration.certificateReleased === true);

    const [isDownloading, setIsDownloading] = useState(false);

    // Push notifications opt-in
    const [pushSupported] = useState(
        () => "Notification" in window && "serviceWorker" in navigator && "PushManager" in window,
    );
    const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(
        () => (typeof Notification !== "undefined" ? Notification.permission : null),
    );
    const [isPushRegistering, setIsPushRegistering] = useState(false);

    async function handleEnablePush() {
        setIsPushRegistering(true);
        try {
            const permission = await Notification.requestPermission();
            setPushPermission(permission);
            if (permission === "granted" && registration?.qrToken) {
                await registerPushToken("web-push-placeholder", { qrToken: registration.qrToken });
                toast.success("Notificações ativadas!");
            }
        } catch {
            // silently fail
        } finally {
            setIsPushRegistering(false);
        }
    }

    // Transfer state
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [transferEmail, setTransferEmail] = useState("");
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferPending, setTransferPending] = useState(false);

    // Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!registration?.qrToken) return;
        getParticipantNotifications(registration.qrToken)
            .then((data) => {
                const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setNotifications(sorted.slice(0, 5));
            })
            .catch(() => {
                // silently fail — notifications are supplementary
            });
    }, [registration?.qrToken]);

    const unreadCount = notifications.filter((n) => n.readAt === null).length;

    const handleMarkRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
        try {
            await markNotificationRead(id);
        } catch {
            // revert on failure
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: null } : n)));
        }
    };

    const handleMarkAllRead = async () => {
        if (!registration?.qrToken) return;
        const prev = notifications;
        setNotifications((n) => n.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
        try {
            await markAllNotificationsRead(registration.qrToken);
        } catch {
            setNotifications(prev);
        }
    };

    const handleDownloadCertificate = async () => {
        if (!registration?.qrToken) return;
        setIsDownloading(true);
        try {
            const res = await api.get(`/certificates/by-token/${registration.qrToken}`, {
                responseType: "blob",
            });
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "certificado.pdf";
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Certificado baixado com sucesso!");
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 403) {
                toast.error("Certificado ainda não disponível.");
            } else {
                toast.error("Erro ao baixar certificado. Tente novamente.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: event?.title ?? "Evento",
                    url: window.location.origin + `/e/${slug}`,
                })
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.origin + `/e/${slug}`);
        }
    };

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!registration?.qrToken || !registration?.eventId) return;
        setIsTransferring(true);
        try {
            await initiateTransfer(registration.eventId, registration.qrToken, transferEmail);
            toast.success("Transferência solicitada! O destinatário receberá um email para aceitar.");
            setShowTransferForm(false);
            setTransferEmail("");
            setTransferPending(true);
        } catch {
            toast.error("Erro ao solicitar transferência");
        } finally {
            setIsTransferring(false);
        }
    };

    if (!registration) {
        return (
            <div className="min-h-screen bg-[#FDFCFF] flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <p className="text-[#6A6680]">Nenhuma inscrição encontrada.</p>
                    <Link
                        to={`/e/${slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                        style={{ color: primaryColor }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar ao evento
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFF] flex flex-col">
            {/* Topo colorido */}
            <div
                className="w-full py-16 px-4 flex flex-col items-center gap-6 text-center"
                style={{ background: `linear-gradient(135deg, rgba(${rgb}, 0.08) 0%, rgba(${rgb}, 0.04) 100%)` }}
            >
                {/* Ícone de sucesso */}
                <div
                    className="relative flex h-24 w-24 items-center justify-center rounded-full"
                    style={{ background: `rgba(${rgb}, 0.12)` }}
                >
                    <CheckCircle2 className="h-12 w-12" style={{ color: primaryColor }} />
                    {/* Rings de pulso */}
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: primaryColor }} />
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-[#19162A]" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
                        Inscrição realizada!
                    </h1>
                    <p className="text-[#6A6680] mt-2 text-base max-w-md">
                        {registration.status === "PENDING"
                            ? "Sua solicitação foi recebida e aguarda aprovação do organizador."
                            : "Você está inscrito. Nos vemos em breve!"}
                    </p>
                </div>

                {/* Badge de status */}
                <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: `rgba(${rgb}, 0.12)`, color: primaryColor }}
                >
                    <CheckCircle2 className="h-4 w-4" />
                    {STATUS_LABELS[registration.status] ?? registration.status}
                </span>
            </div>

            {/* Card de detalhes */}
            <div className="flex-1 flex flex-col items-center px-4 py-10">
                <div className="w-full max-w-md space-y-5">
                    {/* Detalhes da inscrição */}
                    <div className="rounded-2xl border border-[#E4E0F0] bg-white p-6 space-y-4 shadow-sm">
                        <h2 className="text-sm font-semibold text-[#6A6680] uppercase tracking-wider">Detalhes da inscrição</h2>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                                    style={{ background: `rgba(${rgb}, 0.10)` }}
                                >
                                    <User className="h-4 w-4" style={{ color: primaryColor }} />
                                </div>
                                <div>
                                    <p className="text-xs text-[#6A6680]">Nome</p>
                                    <p className="text-sm font-medium text-[#19162A]">{registration.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                                    style={{ background: `rgba(${rgb}, 0.10)` }}
                                >
                                    <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                                </div>
                                <div>
                                    <p className="text-xs text-[#6A6680]">Email</p>
                                    <p className="text-sm font-medium text-[#19162A]">{registration.email}</p>
                                </div>
                            </div>

                            {event && (
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                                        style={{ background: `rgba(${rgb}, 0.10)` }}
                                    >
                                        <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[#6A6680]">Evento</p>
                                        <p className="text-sm font-medium text-[#19162A]">{event.title}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleShare}
                            className="w-full h-11 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                            style={{ background: primaryColor }}
                        >
                            <Share2 className="h-4 w-4" />
                            Compartilhar evento
                        </button>

                        {isCertificateEligible && (
                            <button
                                onClick={handleDownloadCertificate}
                                disabled={isDownloading}
                                className="w-full h-11 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                style={{ background: primaryColor }}
                            >
                                <Award className="h-4 w-4" />
                                {isDownloading ? "Gerando..." : "Baixar certificado"}
                            </button>
                        )}

                        {/* Transferir ingresso */}
                        {registration.status === "CONFIRMED" && !transferPending && (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setShowTransferForm((v) => !v)}
                                    className="w-full h-11 rounded-xl font-medium border border-[#E4E0F0] bg-white text-[#19162A] hover:bg-[#F7F5FB] transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowRightLeft className="h-4 w-4" />
                                    Transferir ingresso
                                </button>

                                {showTransferForm && (
                                    <form
                                        onSubmit={handleTransferSubmit}
                                        className="rounded-xl border border-[#E4E0F0] bg-[#FDFCFF] p-4 space-y-3"
                                    >
                                        <label className="block">
                                            <span className="text-xs font-medium text-[#6A6680] mb-1 block">Email do destinatário</span>
                                            <input
                                                type="email"
                                                required
                                                value={transferEmail}
                                                onChange={(e) => setTransferEmail(e.target.value)}
                                                placeholder="destinatario@email.com"
                                                className="w-full h-10 rounded-lg border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#B0ACBF] focus:outline-none focus:ring-2 transition"
                                                style={{ focusRingColor: primaryColor } as React.CSSProperties}
                                            />
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={isTransferring}
                                                className="flex-1 h-9 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                                                style={{ background: primaryColor }}
                                            >
                                                {isTransferring ? "Enviando..." : "Confirmar transferência"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowTransferForm(false);
                                                    setTransferEmail("");
                                                }}
                                                className="h-9 px-4 rounded-lg text-sm font-medium border border-[#E4E0F0] bg-white text-[#6A6680] hover:bg-[#F7F5FB] transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {transferPending && (
                            <div className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#E4E0F0] bg-[#FDFCFF]">
                                <ArrowRightLeft className="h-4 w-4 text-[#6A6680]" />
                                <span className="text-sm font-medium text-[#6A6680]">Transferência pendente</span>
                            </div>
                        )}

                        <Link
                            to={`/e/${slug}`}
                            className="w-full h-11 rounded-xl font-medium border border-[#E4E0F0] text-[#19162A] hover:bg-[#F7F5FB] transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar ao evento
                        </Link>
                    </div>

                    <p className="text-center text-xs text-[#B0ACBF] pb-4">
                        Guarde este email de confirmação — ele pode ser necessário no dia do evento.
                    </p>

                    {/* Push notifications opt-in */}
                    {pushSupported && pushPermission !== "granted" && (
                        <div className="rounded-2xl border border-[#E4E0F0] bg-white p-5 space-y-3 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                                    style={{ background: `rgba(${hexToRgb(primaryColor)}, 0.10)` }}
                                >
                                    <BellRing className="h-4 w-4" style={{ color: primaryColor }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#19162A]">Receber notificações</p>
                                    <p className="text-xs text-[#6A6680]">Seja avisado sobre aprovação, certificado e lembretes</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEnablePush}
                                disabled={isPushRegistering || pushPermission === "denied"}
                                className="w-full h-10 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: primaryColor, color: "#fff" }}
                            >
                                <Bell className="h-4 w-4" />
                                {isPushRegistering
                                    ? "Ativando..."
                                    : pushPermission === "denied"
                                    ? "Bloqueado nas configurações do browser"
                                    : "Ativar notificações push"}
                            </button>
                        </div>
                    )}

                    {/* Open Badge — LinkedIn */}
                    {isCertificateEligible && (
                        <a
                            href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(event?.title ?? "Certificado")}&organizationName=Kora+Events&issueYear=${new Date(event?.endDate ?? "").getFullYear()}&issueMonth=${new Date(event?.endDate ?? "").getMonth() + 1}&certUrl=${encodeURIComponent(window.location.origin + `/e/${slug}/confirmacao`)}&certId=${registration?.qrToken ?? ""}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-medium transition-colors"
                            style={{
                                background: "#0A66C2",
                                color: "#fff",
                            }}
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            Adicionar certificado ao LinkedIn
                        </a>
                    )}

                    {/* Notificações */}
                    {notifications.length > 0 && (
                        <div className="rounded-2xl border border-[#E4E0F0] bg-white p-6 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-[#6A6680] uppercase tracking-wider">Notificações</h2>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs font-medium hover:underline transition-colors"
                                        style={{ color: primaryColor }}
                                    >
                                        Marcar todas como lidas
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {notifications.map((n) => {
                                    const isUnread = n.readAt === null;
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => isUnread && handleMarkRead(n.id)}
                                            className={[
                                                "w-full text-left rounded-xl px-4 py-3 transition-colors",
                                                isUnread ? "border-l-4 hover:bg-[#F7F5FB]" : "border border-[#E4E0F0] hover:bg-[#FDFCFF]",
                                            ].join(" ")}
                                            style={
                                                isUnread
                                                    ? {
                                                          borderLeftColor: primaryColor,
                                                          background: `rgba(${rgb}, 0.05)`,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <div className="flex items-start gap-3">
                                                <span style={{ color: n.type === "REJECTION" ? undefined : primaryColor }}>
                                                    <NotificationIcon type={n.type} />
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#19162A] leading-snug">{n.title}</p>
                                                    <p className="text-sm text-[#6A6680] mt-0.5 leading-snug">{n.body}</p>
                                                    <p className="text-xs text-[#B0ACBF] mt-1">{timeAgo(n.createdAt)}</p>
                                                </div>
                                                {isUnread && (
                                                    <span
                                                        className="mt-1 h-2 w-2 rounded-full shrink-0"
                                                        style={{ background: primaryColor }}
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="py-6 border-t border-[#E4E0F0]">
                <p className="text-center text-xs text-[#B0ACBF]">
                    Powered by{" "}
                    <span className="font-semibold" style={{ color: primaryColor }}>
                        Kora Events
                    </span>
                </p>
            </footer>
        </div>
    );
}
