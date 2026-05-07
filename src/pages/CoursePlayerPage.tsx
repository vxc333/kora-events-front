import { useState } from "react";
import { useParams } from "react-router-dom";
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
import { getCourse, completeModule, getModuleQuiz, submitQuiz } from "@/services/courses";
import type { Course, CourseModule, QuizQuestion, QuizResult } from "@/services/courses";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────

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

// ── Mock data (used when API is not available) ────────────────────────

const MOCK_COURSE: Course = {
    id: "mock",
    title: "Introdução à Organização de Eventos",
    description:
        "Aprenda os fundamentos para criar, promover e executar eventos memoráveis. Desde o planejamento até o pós-evento, este curso cobre tudo que você precisa.",
    coverUrl: null,
    totalDuration: 180,
    minimumCompletion: 80,
    enrolledAt: new Date().toISOString(),
    certificateAvailable: false,
    modules: [
        { id: "m1", title: "Introdução ao planejamento de eventos", videoUrl: null, duration: 18, order: 1, completedAt: null },
        { id: "m2", title: "Definindo público e objetivos", videoUrl: null, duration: 22, order: 2, completedAt: null },
        { id: "m3", title: "Orçamento e fornecedores", videoUrl: null, duration: 35, order: 3, completedAt: null },
        { id: "m4", title: "Marketing e divulgação", videoUrl: null, duration: 28, order: 4, completedAt: null },
        { id: "m5", title: "Logística no dia do evento", videoUrl: null, duration: 40, order: 5, completedAt: null },
        { id: "m6", title: "Relatórios e pós-evento", videoUrl: null, duration: 37, order: 6, completedAt: null },
    ],
};

const MOCK_QUIZ: QuizQuestion[] = [
    {
        id: "q1",
        question: "Qual é o primeiro passo no planejamento de um evento?",
        options: ["Contratar fornecedores", "Definir objetivos e público-alvo", "Criar artes de divulgação", "Reservar o local"],
        correctIndex: 1,
    },
    {
        id: "q2",
        question: "O que deve estar incluído no orçamento do evento?",
        options: [
            "Apenas custos de marketing",
            "Somente despesas com local",
            "Todos os custos: local, equipe, marketing e contingência",
            "Só os custos fixos",
        ],
        correctIndex: 2,
    },
    {
        id: "q3",
        question: "O relatório pós-evento serve principalmente para:",
        options: [
            "Divulgar o sucesso nas redes",
            "Registrar métricas e aprender com a experiência",
            "Cobrar fornecedores",
            "Emitir certificados",
        ],
        correctIndex: 1,
    },
];

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

// ── QuizSection ───────────────────────────────────────────────────────

function QuizSection({ courseId, moduleId }: { courseId: string; moduleId: string }) {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<QuizResult | null>(null);
    const [expanded, setExpanded] = useState(false);

    const { data: questions, isLoading } = useQuery({
        queryKey: ["quiz", courseId, moduleId],
        queryFn: () => getModuleQuiz(courseId, moduleId),
        retry: false,
        enabled: expanded,
        // Fallback to mock when API doesn't exist
        placeholderData: MOCK_QUIZ,
    });

    const submitMutation = useMutation({
        mutationFn: (ans: number[]) => submitQuiz(courseId, moduleId, ans),
        onSuccess: (data) => setResult(data),
        onError: () => {
            // simulate result with mock
            const correct = MOCK_QUIZ.filter((q, i) => answers[q.id] === MOCK_QUIZ[i]?.correctIndex).length;
            const total = MOCK_QUIZ.length;
            setResult({ correct, total, passed: correct / total >= 0.7 });
        },
    });

    const quizList = questions ?? MOCK_QUIZ;

    function handleSubmit() {
        const ans = quizList.map((q) => answers[q.id] ?? -1);
        submitMutation.mutate(ans);
    }

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(139,92,246,0.2)", background: "rgba(255,255,255,0.03)" }}
        >
            <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center justify-between w-full px-5 py-4 text-left"
            >
                <span className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: "#C4B5FD" }}>
                    <BookOpen className="h-4 w-4" />
                    Quiz do módulo
                </span>
                <ChevronRight
                    className="h-4 w-4 transition-transform"
                    style={{ color: "rgba(196,181,253,0.5)", transform: expanded ? "rotate(90deg)" : "none" }}
                />
            </button>

            {expanded && (
                <div className="px-5 pb-5">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : result ? (
                        <div
                            className="rounded-xl p-5 text-center"
                            style={{
                                background: result.passed
                                    ? "rgba(22,163,74,0.1)"
                                    : "rgba(220,38,38,0.1)",
                                border: `1px solid ${result.passed ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
                            }}
                        >
                            <p
                                className="text-2xl font-bold"
                                style={{ color: result.passed ? "#4ADE80" : "#F87171" }}
                            >
                                {result.correct}/{result.total}
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(237,233,254,0.7)" }}>
                                {result.passed ? "Parabéns! Você passou no quiz." : "Continue estudando e tente novamente."}
                            </p>
                            {!result.passed && (
                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setAnswers({});
                                    }}
                                    className="mt-3 text-xs font-medium"
                                    style={{ color: "#C4B5FD" }}
                                >
                                    Tentar novamente
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {quizList.map((q, qi) => (
                                <div key={q.id}>
                                    <p className="text-sm font-medium mb-3" style={{ color: "#EDE9FE" }}>
                                        {qi + 1}. {q.question}
                                    </p>
                                    <div className="space-y-2">
                                        {q.options.map((opt, oi) => (
                                            <label
                                                key={oi}
                                                className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 transition-colors"
                                                style={{
                                                    background:
                                                        answers[q.id] === oi
                                                            ? "rgba(124,58,237,0.15)"
                                                            : "rgba(255,255,255,0.04)",
                                                    border:
                                                        answers[q.id] === oi
                                                            ? "1px solid rgba(124,58,237,0.4)"
                                                            : "1px solid rgba(255,255,255,0.08)",
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${q.id}`}
                                                    value={oi}
                                                    checked={answers[q.id] === oi}
                                                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                                                    className="sr-only"
                                                />
                                                <span
                                                    className="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                                    style={{
                                                        borderColor: answers[q.id] === oi ? "#7C3AED" : "rgba(255,255,255,0.2)",
                                                    }}
                                                >
                                                    {answers[q.id] === oi && (
                                                        <span
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ background: "#7C3AED" }}
                                                        />
                                                    )}
                                                </span>
                                                <span className="text-sm" style={{ color: "rgba(237,233,254,0.75)" }}>
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <Button
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length < quizList.length || submitMutation.isPending}
                                className="w-full font-semibold"
                                style={{
                                    background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                                    color: "#fff",
                                    border: "none",
                                }}
                            >
                                {submitMutation.isPending ? "Enviando..." : "Enviar respostas"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
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

// ── CoursePlayerPage ──────────────────────────────────────────────────

export function CoursePlayerPage() {
    const { id: courseId = "mock" } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showCompletion, setShowCompletion] = useState(false);

    const { data: course, isLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => getCourse(courseId),
        retry: false,
        placeholderData: MOCK_COURSE,
    });

    const completeMutation = useMutation({
        mutationFn: ({ modId }: { modId: string }) => completeModule(courseId, modId),
        onSuccess: (updatedModule) => {
            queryClient.setQueryData<Course>(["course", courseId], (old) => {
                if (!old) return old;
                const updated = {
                    ...old,
                    modules: old.modules.map((m) => (m.id === updatedModule.id ? updatedModule : m)),
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
            // simulate locally when API not available
            queryClient.setQueryData<Course>(["course", courseId], (old) => {
                if (!old) return old;
                const activeModule = old.modules[activeModuleIndex];
                if (!activeModule) return old;
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

    const displayCourse = course ?? MOCK_COURSE;
    const activeModule: CourseModule | undefined = displayCourse.modules[activeModuleIndex];
    const progress = calcProgress(displayCourse);
    const isCurrentCompleted = activeModule?.completedAt !== null;

    if (isLoading && !course) {
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

    return (
        <div className="flex h-full min-h-screen" style={{ background: "var(--color-bg)" }}>
            {showCompletion && (
                <CompletionModal course={displayCourse} onClose={() => setShowCompletion(false)} />
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
                            {displayCourse.title}
                        </h2>

                        {/* Progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                    Progresso
                                </span>
                                <span
                                    className="text-xs font-semibold"
                                    style={{ color: progress >= displayCourse.minimumCompletion ? "#4ADE80" : "#C4B5FD" }}
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
                                            progress >= displayCourse.minimumCompletion
                                                ? "#4ADE80"
                                                : "linear-gradient(90deg, #7C3AED, #C4B5FD)",
                                    }}
                                />
                            </div>
                            <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                                {displayCourse.modules.filter((m) => m.completedAt).length}/
                                {displayCourse.modules.length} módulos
                            </p>
                        </div>
                    </div>

                    {/* Module list */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                        {displayCourse.modules.map((mod, i) => (
                            <ModuleItem
                                key={mod.id}
                                mod={mod}
                                active={i === activeModuleIndex}
                                onClick={() => setActiveModuleIndex(i)}
                            />
                        ))}
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
                            {activeModuleIndex + 1} / {displayCourse.modules.length}
                        </span>
                        <button
                            disabled={activeModuleIndex >= displayCourse.modules.length - 1}
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
                                    {displayCourse.description}
                                </p>
                            </div>

                            {/* Quiz */}
                            <QuizSection courseId={courseId} moduleId={activeModule.id} />

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
                            {isCurrentCompleted && activeModuleIndex < displayCourse.modules.length - 1 && (
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
                                            {displayCourse.modules[activeModuleIndex + 1]?.title}
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
