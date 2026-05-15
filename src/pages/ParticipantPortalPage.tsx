import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, Download, CheckCircle2, Clock, AlertCircle, LogOut, Ticket, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { portalLogin, getPortalEvents, downloadPortalCertificate, getPortalCourses } from "@/services/participantPortal";
import type { PortalAuth, PortalEvent, PortalCourse } from "@/services/participantPortal";

// ── Helpers ───────────────────────────────────────────────────────────

const SESSION_KEY = "portal_auth";

function getSession(): PortalAuth | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as PortalAuth) : null;
    } catch {
        return null;
    }
}

function saveSession(auth: PortalAuth): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(auth));
}

function clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY);
}

function formatCpf(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

// ── Status config ─────────────────────────────────────────────────────

type EventStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "WAITLISTED";

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
    CONFIRMED: { label: "Confirmado", className: "bg-green-100 text-green-700 border-green-200" },
    PENDING: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
    CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-600 border-red-200" },
    WAITLISTED: { label: "Lista de espera", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

// ── Event card ────────────────────────────────────────────────────────

function EventCard({ event, qrToken }: { event: PortalEvent; qrToken: string }) {
    const [downloading, setDownloading] = useState(false);
    const status = STATUS_CONFIG[event.status];

    async function handleDownload() {
        setDownloading(true);
        try {
            await downloadPortalCertificate(qrToken, event.eventId);
        } catch {
            // graceful silent fail — API not available yet
        } finally {
            setDownloading(false);
        }
    }

    return (
        <div
            className="flex flex-col sm:flex-row gap-4 rounded-2xl p-5 transition-all"
            style={{
                background: "#fff",
                border: "1.5px solid #EDE8F8",
                boxShadow: "0 2px 12px rgba(91,33,182,0.06)",
            }}
        >
            {/* Left accent */}
            <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ width: 52, height: 52, background: "#EDE9FE" }}
            >
                <Ticket className="h-6 w-6" style={{ color: "#5B21B6" }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <Link
                            to={`/e/${event.eventSlug}`}
                            className="font-semibold text-[#19162A] hover:text-[#5B21B6] transition-colors"
                            style={{ fontSize: "0.9375rem" }}
                        >
                            {event.eventTitle}
                        </Link>
                        {event.ticketName && (
                            <p className="text-xs text-[#6A6680] mt-0.5">{event.ticketName}</p>
                        )}
                    </div>
                    <Badge className={`text-xs border ${status.className}`}>{status.label}</Badge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-[#6A6680]">
                        <Calendar className="h-3.5 w-3.5 text-[#9CA3AF]" />
                        {formatDate(event.eventDate)}
                    </span>
                    {event.checkedInAt && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Check-in realizado
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            {event.certificateAvailable && (
                <div className="flex-shrink-0 flex items-center">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="gap-1.5 border-[#DDD8EE] text-[#5B21B6] hover:bg-[#EDE9FE] text-xs"
                    >
                        {downloading ? (
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        Certificado
                    </Button>
                </div>
            )}
        </div>
    );
}

// ── Skeleton card ─────────────────────────────────────────────────────

function EventCardSkeleton() {
    return (
        <div className="flex gap-4 rounded-2xl p-5 border border-[#EDE8F8] bg-white">
            <Skeleton className="w-13 h-13 rounded-xl flex-shrink-0" style={{ width: 52, height: 52 }} />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
            </div>
        </div>
    );
}

// ── Portal course card ────────────────────────────────────────────────

function PortalCourseCard({ course, qrToken }: { course: PortalCourse; qrToken: string }) {
    return (
        <Link
            to={`/portal/cursos/${course.id}?qrToken=${qrToken}`}
            className="flex flex-col rounded-2xl overflow-hidden transition-all hover:shadow-md"
            style={{
                background: "#fff",
                border: "1.5px solid #EDE8F8",
                boxShadow: "0 2px 12px rgba(91,33,182,0.06)",
            }}
        >
            {/* Cover */}
            <div
                className="h-28 w-full flex items-center justify-center flex-shrink-0"
                style={{
                    background: course.coverUrl
                        ? `url(${course.coverUrl}) center/cover no-repeat`
                        : "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
                }}
            >
                {!course.coverUrl && (
                    <BookOpen className="h-8 w-8" style={{ color: "#7C3AED" }} />
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <div>
                    <p className="text-xs text-[#9CA3AF] mb-0.5">{course.eventTitle}</p>
                    <p className="font-semibold text-[#19162A] text-sm leading-snug line-clamp-2">
                        {course.title}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#6A6680]">Progresso</span>
                        <span
                            className="text-xs font-semibold"
                            style={{ color: course.progress >= course.minimumCompletion ? "#16A34A" : "#5B21B6" }}
                        >
                            {course.progress}%
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-[#EDE8F8]">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${course.progress}%`,
                                background:
                                    course.progress >= course.minimumCompletion
                                        ? "#16A34A"
                                        : "linear-gradient(90deg, #7C3AED, #A78BFA)",
                            }}
                        />
                    </div>
                </div>

                <Button
                    size="sm"
                    className="w-full mt-auto font-semibold"
                    style={{ background: "#5B21B6", color: "#fff", border: "none" }}
                >
                    {course.progress > 0 ? "Continuar" : "Começar"}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
            </div>
        </Link>
    );
}

// ── Empty events state ────────────────────────────────────────────────

function EmptyEvents() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl"
                style={{ background: "#EDE9FE", border: "2px dashed #C4B5FD" }}
            >
                <Ticket className="h-7 w-7" style={{ color: "#7C3AED" }} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#19162A]">Nenhuma inscrição encontrada</h3>
                <p className="text-sm text-[#6A6680] max-w-xs">
                    Você ainda não está inscrito em nenhum evento. Explore o marketplace!
                </p>
            </div>
            <Link to="/eventos">
                <Button className="gap-2" style={{ background: "#5B21B6", color: "#fff", border: "none" }}>
                    Descobrir eventos
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}

// ── Dashboard view ────────────────────────────────────────────────────

function DashboardView({ auth, onLogout }: { auth: PortalAuth; onLogout: () => void }) {
    const { data: events, isLoading } = useQuery({
        queryKey: ["portal-events", auth.qrToken],
        queryFn: () => getPortalEvents(auth.qrToken),
        retry: false,
        // Handle API not existing yet — return empty array
    });

    const { data: courses } = useQuery({
        queryKey: ["portal-courses", auth.qrToken],
        queryFn: () => getPortalCourses(auth.qrToken),
        retry: false,
    });

    const eventList = events ?? [];
    const courseList = courses ?? [];
    const firstName = auth.participantName.split(" ")[0];

    return (
        <div className="min-h-screen" style={{ background: "#FDFCFF" }}>
            {/* Header */}
            <header
                className="sticky top-0 z-40 px-6 md:px-10"
                style={{
                    background: "rgba(253,252,255,0.92)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid #EDE8F8",
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Link to="/" className="text-sm font-semibold text-[#5B21B6]">
                    ← Kora Events
                </Link>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#6A6680] hover:text-[#5B21B6] transition-colors"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Sair
                </button>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10">
                {/* Greeting */}
                <div className="mb-8">
                    <p className="text-sm text-[#9CA3AF] mb-1">Bem-vindo de volta,</p>
                    <h1
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                            color: "#19162A",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Olá, {firstName}{" "}
                        <span role="img" aria-label="wave">
                            👋
                        </span>
                    </h1>
                    <p className="text-sm text-[#6A6680] mt-1">{auth.participantEmail}</p>
                </div>

                {/* Events section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-[#19162A]">Minhas inscrições</h2>
                        {eventList.length > 0 && (
                            <span className="text-xs text-[#9CA3AF]">{eventList.length} evento{eventList.length !== 1 ? "s" : ""}</span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <EventCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : eventList.length === 0 ? (
                        <EmptyEvents />
                    ) : (
                        <div className="space-y-3">
                            {eventList.map((event) => (
                                <EventCard key={event.eventId} event={event} qrToken={auth.qrToken} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Courses section */}
                {courseList.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-[#19162A]">Meus cursos</h2>
                            <span className="text-xs text-[#9CA3AF]">
                                {courseList.length} curso{courseList.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {courseList.map((course: PortalCourse) => (
                                <PortalCourseCard key={course.id} course={course} qrToken={auth.qrToken} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// ── Login view ────────────────────────────────────────────────────────

function LoginView({ onLogin }: { onLogin: (auth: PortalAuth) => void }) {
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [apiError, setApiError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: ({ cpfVal, emailVal }: { cpfVal: string; emailVal: string }) =>
            portalLogin(cpfVal.replace(/\D/g, ""), emailVal),
        onSuccess: (auth) => {
            saveSession(auth);
            onLogin(auth);
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setApiError(msg ?? "Não encontramos inscrições com esses dados. Verifique e tente novamente.");
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiError(null);
        const rawCpf = cpf.replace(/\D/g, "");
        if (rawCpf.length !== 11 || !email.trim()) return;
        loginMutation.mutate({ cpfVal: rawCpf, emailVal: email.trim() });
    }

    const cpfValid = cpf.replace(/\D/g, "").length === 11;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#FDFCFF" }}>
            {/* Nav */}
            <header
                className="px-6 md:px-10 flex items-center justify-between"
                style={{ height: 60, borderBottom: "1px solid #EDE8F8" }}
            >
                <Link to="/" className="text-sm font-semibold text-[#5B21B6]">
                    ← Kora Events
                </Link>
                <Link
                    to="/eventos"
                    className="text-xs font-medium text-[#6A6680] hover:text-[#5B21B6] transition-colors"
                >
                    Explorar eventos
                </Link>
            </header>

            {/* Card */}
            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div
                    className="w-full max-w-md rounded-3xl p-8"
                    style={{
                        background: "#fff",
                        border: "1.5px solid #EDE8F8",
                        boxShadow: "0 8px 48px rgba(91,33,182,0.08)",
                    }}
                >
                    {/* Icon */}
                    <div
                        className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-6"
                        style={{ background: "#EDE9FE" }}
                    >
                        <Ticket className="h-7 w-7" style={{ color: "#5B21B6" }} />
                    </div>

                    <h1
                        className="text-center mb-2"
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.625rem",
                            color: "#19162A",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Meu Portal de Eventos
                    </h1>
                    <p className="text-center text-sm text-[#6A6680] mb-8">
                        Acesse seu histórico com CPF e e-mail
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* CPF */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-[#19162A]">CPF</label>
                            <input
                                type="text"
                                value={cpf}
                                inputMode="numeric"
                                placeholder="000.000.000-00"
                                onChange={(e) => setCpf(formatCpf(e.target.value))}
                                className="h-11 w-full rounded-xl border border-[#E4E0F0] bg-white px-4 text-sm text-[#19162A] placeholder:text-[#B0ACBF] focus:outline-none transition-shadow"
                                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #5B21B6")}
                                onBlur={(e) => (e.target.style.boxShadow = "none")}
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-[#19162A]">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                placeholder="seu@email.com"
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 w-full rounded-xl border border-[#E4E0F0] bg-white px-4 text-sm text-[#19162A] placeholder:text-[#B0ACBF] focus:outline-none transition-shadow"
                                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #5B21B6")}
                                onBlur={(e) => (e.target.style.boxShadow = "none")}
                            />
                        </div>

                        {/* Error */}
                        {apiError && (
                            <div
                                className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                                style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                            >
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{apiError}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={!cpfValid || !emailValid || loginMutation.isPending}
                            className="w-full h-11 font-semibold gap-2 mt-2"
                            style={{
                                background: cpfValid && emailValid ? "#5B21B6" : "#E4E0F0",
                                color: cpfValid && emailValid ? "#fff" : "#9CA3AF",
                                border: "none",
                                transition: "background 0.2s",
                            }}
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-[#9CA3AF] mt-6">
                        Não é necessário senha. Usamos seu CPF e e-mail para identificar suas inscrições.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-6">
                <p className="text-xs text-[#9CA3AF]">
                    © {new Date().getFullYear()} Kora Events
                </p>
            </footer>
        </div>
    );
}

// ── ParticipantPortalPage ─────────────────────────────────────────────

export function ParticipantPortalPage() {
    const [auth, setAuth] = useState<PortalAuth | null>(() => getSession());

    function handleLogin(newAuth: PortalAuth) {
        setAuth(newAuth);
    }

    function handleLogout() {
        clearSession();
        setAuth(null);
    }

    if (!auth) {
        return <LoginView onLogin={handleLogin} />;
    }

    return <DashboardView auth={auth} onLogout={handleLogout} />;
}
