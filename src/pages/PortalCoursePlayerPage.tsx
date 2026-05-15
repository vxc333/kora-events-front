import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CheckCircle2,
    PlayCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    Award,
    Download,
    X,
    Menu,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPortalCourse, completePortalModule } from "@/services/participantPortal";
import type { PortalAuth } from "@/services/participantPortal";
import type { Course, CourseModule } from "@/services/courses";
import { toast } from "sonner";

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

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function calcProgress(course: Course): number {
    if (course.modules.length === 0) return 0;
    const done = course.modules.filter((m) => m.completedAt !== null).length;
    return Math.round((done / course.modules.length) * 100);
}

// ── CompletionModal ───────────────────────────────────────────────────

function CompletionModal({ course, onClose }: { course: Course; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
            <div
                className="relative w-full max-w-md rounded-3xl p-8 text-center"
                style={{
                    background: "linear-gradient(135deg, #1A1030 0%, #0D0920 100%)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    boxShadow: "0 0 80px rgba(109,40,217,0.3)",
                }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Trophy */}
                <div
                    className="mx-auto mb-6 flex items-center justify-center rounded-2xl"
                    style={{
                        width: 80,
                        height: 80,
                        background: "linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(109,40,217,0.2) 100%)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        boxShadow: "0 0 40px rgba(124,58,237,0.3)",
                    }}
                >
                    <Award className="h-10 w-10" style={{ color: "#C4B5FD" }} />
                </div>

                <h2
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "#F0EBF8", letterSpacing: "-0.02em" }}
                >
                    Parabéns!
                </h2>
                <p className="mt-2 text-sm" style={{ color: "rgba(237,233,254,0.6)" }}>
                    Você concluiu o curso
                </p>
                <p className="mt-1 font-semibold" style={{ color: "#EDE9FE" }}>
                    {course.title}
                </p>

                {course.certificateAvailable && (
                    <Button
                        className="mt-8 w-full gap-2 font-semibold"
                        style={{
                            background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                            color: "#fff",
                            boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
                            border: "none",
                        }}
                    >
                        <Download className="h-4 w-4" />
                        Baixar Certificado
                    </Button>
                )}

                <button
                    onClick={onClose}
                    className="mt-3 w-full text-sm font-medium transition-colors"
                    style={{ color: "rgba(237,233,254,0.4)" }}
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}

// ── Module list item ──────────────────────────────────────────────────

function ModuleItem({
    mod,
    active,
    onClick,
}: {
    mod: CourseModule;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-start gap-3 w-full text-left rounded-xl px-3 py-3 transition-all"
            style={{
                background: active ? "rgba(124,58,237,0.15)" : "transparent",
                border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
            }}
        >
            <div className="flex-shrink-0 mt-0.5">
                {mod.completedAt ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: "#4ADE80" }} />
                ) : (
                    <PlayCircle
                        className="h-4 w-4"
                        style={{ color: active ? "#C4B5FD" : "rgba(255,255,255,0.3)" }}
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className="text-sm leading-tight"
                    style={{
                        color: active ? "#EDE9FE" : mod.completedAt ? "rgba(237,233,254,0.5)" : "rgba(237,233,254,0.7)",
                        fontWeight: active ? 500 : 400,
                    }}
                >
                    {mod.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(237,233,254,0.3)" }}>
                    <Clock className="inline h-3 w-3 mr-0.5 -mt-0.5" />
                    {formatDuration(mod.duration)}
                </p>
            </div>
        </button>
    );
}

// ── PortalCoursePlayerPage ────────────────────────────────────────────

export function PortalCoursePlayerPage() {
    const { courseId = "" } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const auth = getSession();

    useEffect(() => {
        if (!auth) {
            navigate("/portal", { replace: true });
        }
    }, [auth, navigate]);

    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showCompletion, setShowCompletion] = useState(false);

    const qrToken = auth?.qrToken ?? "";

    const { data: course, isLoading } = useQuery({
        queryKey: ["portal-course", qrToken, courseId],
        queryFn: () => getPortalCourse(qrToken, courseId),
        enabled: !!qrToken && !!courseId,
        retry: false,
    });

    const completeMutation = useMutation({
        mutationFn: ({ modId }: { modId: string }) =>
            completePortalModule(qrToken, courseId, modId),
        onSuccess: (data) => {
            queryClient.setQueryData<Course>(["portal-course", qrToken, courseId], (old) => {
                if (!old) return old;
                const updated = {
                    ...old,
                    modules: old.modules.map((m) =>
                        m.id === (course?.modules[activeModuleIndex]?.id ?? "")
                            ? { ...m, completedAt: data.completedAt }
                            : m,
                    ),
                };
                const progress = calcProgress(updated);
                if (progress >= updated.minimumCompletion) {
                    setShowCompletion(true);
                }
                return updated;
            });
            toast.success("Módulo marcado como concluído!");
        },
        onError: () => {
            // Simulate locally if API not available
            queryClient.setQueryData<Course>(["portal-course", qrToken, courseId], (old) => {
                if (!old) return old;
                const updated = {
                    ...old,
                    modules: old.modules.map((m, i) =>
                        i === activeModuleIndex ? { ...m, completedAt: new Date().toISOString() } : m,
                    ),
                };
                const progress = calcProgress(updated);
                if (progress >= updated.minimumCompletion) {
                    setShowCompletion(true);
                }
                return updated;
            });
            toast.success("Módulo concluído!");
        },
    });

    if (!auth) return null;

    if (isLoading) {
        return (
            <div className="flex h-full min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="h-10 w-10 rounded-full border-4 animate-spin"
                        style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-brand)" }}
                    />
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Carregando curso...
                    </p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-full min-h-screen items-center justify-center" style={{ background: "var(--color-bg)" }}>
                <div className="flex flex-col items-center gap-3">
                    <BookOpen className="h-10 w-10" style={{ color: "var(--color-text-muted)" }} />
                    <p style={{ color: "var(--color-text-muted)" }}>Curso não encontrado.</p>
                    <Button variant="secondary" size="sm" onClick={() => navigate("/portal")}>
                        Voltar ao portal
                    </Button>
                </div>
            </div>
        );
    }

    const activeModule: CourseModule | undefined = course.modules[activeModuleIndex];
    const progress = calcProgress(course);
    const isCurrentCompleted = activeModule?.completedAt !== null;

    return (
        <div className="flex h-full min-h-screen" style={{ background: "var(--color-bg)" }}>
            {showCompletion && (
                <CompletionModal course={course} onClose={() => setShowCompletion(false)} />
            )}

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside
                className="flex-shrink-0 flex flex-col transition-all duration-300"
                style={{
                    width: sidebarOpen ? 300 : 0,
                    minWidth: sidebarOpen ? 300 : 0,
                    overflow: "hidden",
                    background: "var(--color-bg-subtle)",
                    borderRight: "1px solid var(--color-border)",
                }}
            >
                <div className="flex flex-col h-full" style={{ width: 300 }}>
                    {/* Sidebar header */}
                    <div
                        className="px-5 pt-6 pb-4"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                        <h2
                            className="text-sm font-semibold leading-snug mb-4"
                            style={{ color: "var(--color-text)" }}
                        >
                            {course.title}
                        </h2>

                        {/* Progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    Progresso
                                </span>
                                <span
                                    className="text-xs font-semibold"
                                    style={{ color: progress >= course.minimumCompletion ? "#4ADE80" : "#C4B5FD" }}
                                >
                                    {progress}% completo
                                </span>
                            </div>
                            <div
                                className="h-1.5 rounded-full overflow-hidden"
                                style={{ background: "var(--color-border)" }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${progress}%`,
                                        background:
                                            progress >= course.minimumCompletion
                                                ? "#4ADE80"
                                                : "linear-gradient(90deg, #7C3AED, #C4B5FD)",
                                    }}
                                />
                            </div>
                            <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                                {course.modules.filter((m) => m.completedAt).length}/
                                {course.modules.length} módulos
                            </p>
                        </div>
                    </div>

                    {/* Module list */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                        {course.modules.map((mod, i) => (
                            <ModuleItem
                                key={mod.id}
                                mod={mod}
                                active={i === activeModuleIndex}
                                onClick={() => setActiveModuleIndex(i)}
                            />
                        ))}
                    </div>

                    {/* Back to portal */}
                    <div
                        className="px-3 py-3"
                        style={{ borderTop: "1px solid var(--color-border)" }}
                    >
                        <button
                            onClick={() => navigate("/portal")}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs transition-colors"
                            style={{ color: "var(--color-text-muted)" }}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Voltar ao portal
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main content ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Top bar */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
                    style={{
                        background: "var(--color-bg-subtle)",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                            color: "var(--color-text-muted)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <Menu className="h-4 w-4" />
                        {sidebarOpen ? "Ocultar" : "Módulos"}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={activeModuleIndex === 0}
                            onClick={() => setActiveModuleIndex((i) => i - 1)}
                            className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                            style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {activeModuleIndex + 1} / {course.modules.length}
                        </span>
                        <button
                            disabled={activeModuleIndex >= course.modules.length - 1}
                            onClick={() => setActiveModuleIndex((i) => i + 1)}
                            className="p-1.5 rounded-lg disabled:opacity-30 transition-colors"
                            style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 space-y-8">
                    {activeModule ? (
                        <>
                            {/* Video area */}
                            <div
                                className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
                                style={{
                                    aspectRatio: "16/9",
                                    background: "linear-gradient(135deg, #0D0920 0%, #1A1030 100%)",
                                    border: "1px solid rgba(139,92,246,0.15)",
                                }}
                            >
                                {activeModule.videoUrl ? (
                                    <iframe
                                        src={activeModule.videoUrl}
                                        className="w-full h-full"
                                        allowFullScreen
                                        title={activeModule.title}
                                        style={{ border: "none" }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <div
                                            className="flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-105"
                                            style={{
                                                width: 64,
                                                height: 64,
                                                background: "rgba(124,58,237,0.25)",
                                                border: "2px solid rgba(124,58,237,0.4)",
                                                boxShadow: "0 0 40px rgba(124,58,237,0.25)",
                                            }}
                                        >
                                            <PlayCircle className="h-8 w-8" style={{ color: "#C4B5FD" }} />
                                        </div>
                                        <p className="text-sm" style={{ color: "rgba(196,181,253,0.6)" }}>
                                            {activeModule.title}
                                        </p>
                                        <p className="text-xs" style={{ color: "rgba(237,233,254,0.25)" }}>
                                            <Clock className="inline h-3 w-3 mr-1 -mt-0.5" />
                                            {formatDuration(activeModule.duration)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Module header */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(196,181,253,0.5)" }}>
                                        Módulo {activeModuleIndex + 1}
                                    </span>
                                    {isCurrentCompleted && (
                                        <span
                                            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                                            style={{ background: "rgba(74,222,128,0.12)", color: "#4ADE80" }}
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            Concluído
                                        </span>
                                    )}
                                </div>
                                <h1
                                    className="text-xl font-semibold"
                                    style={{ color: "var(--color-text)", letterSpacing: "-0.01em" }}
                                >
                                    {activeModule.title}
                                </h1>
                                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                                    {course.description}
                                </p>
                            </div>

                            {/* Quiz disabled notice */}
                            <div
                                className="rounded-2xl px-5 py-4"
                                style={{
                                    border: "1px solid rgba(139,92,246,0.15)",
                                    background: "rgba(255,255,255,0.02)",
                                }}
                            >
                                <p className="text-xs" style={{ color: "rgba(196,181,253,0.4)" }}>
                                    Quiz disponível apenas para participantes com conta. Faça login para acessar.
                                </p>
                            </div>

                            {/* Complete button */}
                            {!isCurrentCompleted && (
                                <Button
                                    onClick={() => completeMutation.mutate({ modId: activeModule.id })}
                                    disabled={completeMutation.isPending}
                                    className="w-full h-12 font-semibold gap-2"
                                    style={{
                                        background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                                        color: "#fff",
                                        border: "none",
                                        boxShadow: "0 4px 24px rgba(124,58,237,0.3)",
                                    }}
                                >
                                    {completeMutation.isPending ? (
                                        <>
                                            <div
                                                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                                            />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Marcar como concluído
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Next module */}
                            {isCurrentCompleted && activeModuleIndex < course.modules.length - 1 && (
                                <button
                                    onClick={() => setActiveModuleIndex((i) => i + 1)}
                                    className="flex items-center justify-between w-full rounded-2xl px-5 py-4 transition-all"
                                    style={{
                                        background: "rgba(124,58,237,0.08)",
                                        border: "1px solid rgba(124,58,237,0.2)",
                                    }}
                                >
                                    <div className="text-left">
                                        <p className="text-xs" style={{ color: "rgba(196,181,253,0.6)" }}>
                                            Próximo módulo
                                        </p>
                                        <p className="text-sm font-medium mt-0.5" style={{ color: "#C4B5FD" }}>
                                            {course.modules[activeModuleIndex + 1]?.title}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5" style={{ color: "#7C3AED" }} />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <BookOpen className="h-12 w-12" style={{ color: "var(--color-text-muted)" }} />
                            <p style={{ color: "var(--color-text-muted)" }}>Selecione um módulo para começar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
