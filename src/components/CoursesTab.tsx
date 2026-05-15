import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    BookOpen,
    Plus,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
    Video,
    HelpCircle,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    getEventCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule,
    addQuizQuestion,
    deleteQuizQuestion,
    getModuleQuiz,
} from "@/services/courses";
import type {
    CourseSummary,
    CourseSummaryModule,
    CreateCourseInput,
    UpdateCourseInput,
    AddModuleInput,
    UpdateModuleInput,
    AddQuizQuestionInput,
    QuizQuestion,
} from "@/services/courses";

// ── Helpers ───────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
    if (minutes === 0) return "0min";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

// ── Course Modal ──────────────────────────────────────────────────────

interface CourseModalProps {
    open: boolean;
    course?: CourseSummary;
    isPending: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCourseInput | UpdateCourseInput) => void;
}

function CourseModal({ open, course, isPending, onClose, onSubmit }: CourseModalProps) {
    const [title, setTitle] = useState(course?.title ?? "");
    const [description, setDescription] = useState(course?.description ?? "");
    const [coverUrl, setCoverUrl] = useState(course?.coverUrl ?? "");
    const [minimumCompletion, setMinimumCompletion] = useState(
        course?.minimumCompletion?.toString() ?? "80",
    );

    // Reset when course changes
    useState(() => {
        setTitle(course?.title ?? "");
        setDescription(course?.description ?? "");
        setCoverUrl(course?.coverUrl ?? "");
        setMinimumCompletion(course?.minimumCompletion?.toString() ?? "80");
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("O título é obrigatório.");
            return;
        }
        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            coverUrl: coverUrl.trim() || undefined,
            minimumCompletion: parseInt(minimumCompletion, 10) || 80,
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{course ? "Editar curso" : "Novo curso"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="course-title">Título *</Label>
                        <Input
                            id="course-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Introdução ao evento"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="course-desc">Descrição</Label>
                        <Textarea
                            id="course-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o conteúdo do curso..."
                            rows={3}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="course-cover">URL da capa</Label>
                        <Input
                            id="course-cover"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="course-min">Mínimo para conclusão (%)</Label>
                        <Input
                            id="course-min"
                            type="number"
                            min={0}
                            max={100}
                            value={minimumCompletion}
                            onChange={(e) => setMinimumCompletion(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={isPending}>
                            {course ? "Salvar" : "Criar curso"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Module Modal ──────────────────────────────────────────────────────

interface ModuleModalProps {
    open: boolean;
    mod?: CourseSummaryModule;
    isPending: boolean;
    onClose: () => void;
    onSubmit: (data: AddModuleInput | UpdateModuleInput) => void;
}

function ModuleModal({ open, mod, isPending, onClose, onSubmit }: ModuleModalProps) {
    const [title, setTitle] = useState(mod?.title ?? "");
    const [videoUrl, setVideoUrl] = useState(mod?.videoUrl ?? "");
    const [duration, setDuration] = useState(mod?.duration?.toString() ?? "");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("O título é obrigatório.");
            return;
        }
        onSubmit({
            title: title.trim(),
            videoUrl: videoUrl.trim() || undefined,
            duration: duration ? parseInt(duration, 10) : undefined,
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{mod ? "Editar módulo" : "Adicionar módulo"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="mod-title">Título *</Label>
                        <Input
                            id="mod-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Introdução"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="mod-video">URL do vídeo</Label>
                        <Input
                            id="mod-video"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="mod-duration">Duração (minutos)</Label>
                        <Input
                            id="mod-duration"
                            type="number"
                            min={0}
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Ex: 30"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" loading={isPending}>
                            {mod ? "Salvar" : "Adicionar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Quiz Editor Modal ─────────────────────────────────────────────────

interface QuizEditorModalProps {
    open: boolean;
    courseId: string;
    moduleId: string;
    onClose: () => void;
}

const EMPTY_QUESTION: AddQuizQuestionInput = {
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
};

function QuizEditorModal({ open, courseId, moduleId, onClose }: QuizEditorModalProps) {
    const queryClient = useQueryClient();
    const queryKey = ["quiz-manage", courseId, moduleId];

    const { data: questions = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => getModuleQuiz(courseId, moduleId),
        enabled: open,
        retry: false,
    });

    const [newQ, setNewQ] = useState<AddQuizQuestionInput>({ ...EMPTY_QUESTION, options: ["", "", "", ""] });
    const [showForm, setShowForm] = useState(false);

    const addMutation = useMutation({
        mutationFn: (data: AddQuizQuestionInput) => addQuizQuestion(courseId, moduleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            setNewQ({ ...EMPTY_QUESTION, options: ["", "", "", ""] });
            setShowForm(false);
            toast.success("Pergunta adicionada!");
        },
        onError: () => toast.error("Erro ao adicionar pergunta."),
    });

    const deleteMutation = useMutation({
        mutationFn: (questionId: string) => deleteQuizQuestion(courseId, moduleId, questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Pergunta removida.");
        },
        onError: () => toast.error("Erro ao remover pergunta."),
    });

    function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newQ.question.trim()) {
            toast.error("A pergunta é obrigatória.");
            return;
        }
        if (newQ.options.some((o) => !o.trim())) {
            toast.error("Preencha todas as opções.");
            return;
        }
        addMutation.mutate(newQ);
    }

    function setOption(index: number, value: string) {
        setNewQ((q) => {
            const opts = [...q.options];
            opts[index] = value;
            return { ...q, options: opts };
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editor de Quiz</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {questions.length === 0 && !showForm && (
                            <p className="text-sm text-text-muted text-center py-4">
                                Nenhuma pergunta ainda. Adicione a primeira!
                            </p>
                        )}

                        {questions.map((q: QuizQuestion, qi: number) => (
                            <div
                                key={q.id}
                                className="rounded-xl border border-border bg-bg p-4 space-y-2"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-text">
                                        {qi + 1}. {q.question}
                                    </p>
                                    <button
                                        onClick={() => deleteMutation.mutate(q.id)}
                                        className="flex-shrink-0 p-1 rounded text-text-muted hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {q.options.map((opt, oi) => (
                                        <li
                                            key={oi}
                                            className={`text-xs px-2.5 py-1.5 rounded-lg ${
                                                oi === q.correctIndex
                                                    ? "bg-emerald-50 text-emerald-700 font-medium border border-emerald-200"
                                                    : "text-text-muted"
                                            }`}
                                        >
                                            {oi === q.correctIndex ? "✓ " : ""}{opt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {showForm ? (
                            <form onSubmit={handleAddSubmit} className="rounded-xl border border-brand/30 bg-bg p-4 space-y-3">
                                <p className="text-sm font-semibold text-text">Nova pergunta</p>
                                <div className="space-y-1.5">
                                    <Label>Pergunta</Label>
                                    <Input
                                        value={newQ.question}
                                        onChange={(e) => setNewQ((q) => ({ ...q, question: e.target.value }))}
                                        placeholder="Digite a pergunta..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Opções</Label>
                                    {newQ.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="correct"
                                                checked={newQ.correctIndex === i}
                                                onChange={() => setNewQ((q) => ({ ...q, correctIndex: i }))}
                                                className="accent-brand flex-shrink-0"
                                            />
                                            <Input
                                                value={opt}
                                                onChange={(e) => setOption(i, e.target.value)}
                                                placeholder={`Opção ${i + 1}`}
                                            />
                                        </div>
                                    ))}
                                    <p className="text-xs text-text-muted">
                                        Selecione o botão de rádio ao lado da resposta correta.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" size="sm" loading={addMutation.isPending}>
                                        Adicionar pergunta
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1.5 w-full"
                                onClick={() => setShowForm(true)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Adicionar pergunta
                            </Button>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Module row ────────────────────────────────────────────────────────

interface ModuleRowProps {
    mod: CourseSummaryModule;
    courseId: string;
    onEdit: (mod: CourseSummaryModule) => void;
    onDelete: (modId: string) => void;
    onQuiz: (modId: string) => void;
}

function ModuleRow({ mod, courseId, onEdit, onDelete, onQuiz }: ModuleRowProps) {
    void courseId; // used by parent context
    return (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-bg-subtle">
            <span className="flex-shrink-0 text-xs font-mono text-text-muted w-5 text-right">{mod.order}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">{mod.title}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {mod.duration > 0 && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="h-3 w-3" />
                        {formatDuration(mod.duration)}
                    </span>
                )}
                {mod.videoUrl && (
                    <span className="p-1 rounded text-blue-500" title="Tem vídeo">
                        <Video className="h-3.5 w-3.5" />
                    </span>
                )}
                {mod.hasQuiz && (
                    <button
                        onClick={() => onQuiz(mod.id)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                    >
                        <HelpCircle className="h-3 w-3" />
                        Quiz
                    </button>
                )}
                {!mod.hasQuiz && (
                    <button
                        onClick={() => onQuiz(mod.id)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-text-muted hover:bg-bg hover:text-text transition-colors border border-border"
                    >
                        <HelpCircle className="h-3 w-3" />
                        Quiz
                    </button>
                )}
                <button
                    onClick={() => onEdit(mod)}
                    className="p-1 rounded text-text-muted hover:text-text transition-colors"
                    title="Editar módulo"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => onDelete(mod.id)}
                    className="p-1 rounded text-text-muted hover:text-red-500 transition-colors"
                    title="Remover módulo"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

// ── Course card ───────────────────────────────────────────────────────

interface CourseCardProps {
    course: CourseSummary;
    onEdit: (course: CourseSummary) => void;
    onDelete: (courseId: string) => void;
    onAddModule: (courseId: string) => void;
    onEditModule: (courseId: string, mod: CourseSummaryModule) => void;
    onDeleteModule: (courseId: string, moduleId: string) => void;
    onQuiz: (courseId: string, moduleId: string) => void;
}

function CourseCard({
    course,
    onEdit,
    onDelete,
    onAddModule,
    onEditModule,
    onDeleteModule,
    onQuiz,
}: CourseCardProps) {
    const [expanded, setExpanded] = useState(false);
    const moduleCount = course.modules.length;
    const hours = Math.floor(course.totalDuration / 60);
    const mins = course.totalDuration % 60;
    const durationLabel =
        hours > 0 && mins > 0
            ? `${hours}h ${mins}min`
            : hours > 0
              ? `${hours}h`
              : `${mins}min`;

    return (
        <div className="rounded-xl border border-border bg-bg overflow-hidden">
            {/* Card header */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-text">{course.title}</p>
                            {course.isPublished ? (
                                <Badge className="border-transparent bg-emerald-100 text-emerald-700 text-[10px]">
                                    Publicado
                                </Badge>
                            ) : (
                                <Badge className="border-transparent bg-slate-100 text-slate-600 text-[10px]">
                                    Rascunho
                                </Badge>
                            )}
                        </div>
                        {course.description && (
                            <p className="text-xs text-text-muted line-clamp-2">{course.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-text-muted pt-0.5">
                            <span>
                                {moduleCount} módulo{moduleCount !== 1 ? "s" : ""}
                            </span>
                            {course.totalDuration > 0 && <span>{durationLabel}</span>}
                            <span>Mínimo {course.minimumCompletion}%</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            onClick={() => onEdit(course)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-subtle transition-colors"
                            title="Editar curso"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(course.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Excluir curso"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-bg-subtle transition-colors border border-border"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp className="h-3.5 w-3.5" />
                                    Recolher
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                    Módulos
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded modules */}
            {expanded && (
                <div className="border-t border-border p-4 space-y-2 bg-bg-subtle/50">
                    {course.modules.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-2">
                            Nenhum módulo. Adicione o primeiro!
                        </p>
                    ) : (
                        course.modules
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map((mod) => (
                                <ModuleRow
                                    key={mod.id}
                                    mod={mod}
                                    courseId={course.id}
                                    onEdit={(m) => onEditModule(course.id, m)}
                                    onDelete={(mId) => onDeleteModule(course.id, mId)}
                                    onQuiz={(mId) => onQuiz(course.id, mId)}
                                />
                            ))
                    )}

                    <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 mt-1"
                        onClick={() => onAddModule(course.id)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar módulo
                    </Button>
                </div>
            )}
        </div>
    );
}

// ── CoursesTab ────────────────────────────────────────────────────────

interface Props {
    eventId: string;
}

export function CoursesTab({ eventId }: Props) {
    const queryClient = useQueryClient();
    const queryKey = ["event-courses", eventId];

    const { data: courses = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => getEventCourses(eventId),
    });

    // ── Course modal state ────────────────────────────────────────────
    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseSummary | undefined>(undefined);

    const createCourseMutation = useMutation({
        mutationFn: (data: CreateCourseInput) => createCourse(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Curso criado com sucesso!");
            setCourseModalOpen(false);
        },
        onError: () => toast.error("Erro ao criar curso."),
    });

    const updateCourseMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCourseInput }) => updateCourse(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Curso atualizado!");
            setCourseModalOpen(false);
            setEditingCourse(undefined);
        },
        onError: () => toast.error("Erro ao atualizar curso."),
    });

    const deleteCourseMutation = useMutation({
        mutationFn: (courseId: string) => deleteCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Curso excluído.");
        },
        onError: () => toast.error("Erro ao excluir curso."),
    });

    function openCreateCourse() {
        setEditingCourse(undefined);
        setCourseModalOpen(true);
    }

    function openEditCourse(course: CourseSummary) {
        setEditingCourse(course);
        setCourseModalOpen(true);
    }

    function handleCourseSubmit(data: CreateCourseInput | UpdateCourseInput) {
        if (editingCourse) {
            updateCourseMutation.mutate({ id: editingCourse.id, data });
        } else {
            createCourseMutation.mutate(data as CreateCourseInput);
        }
    }

    function handleDeleteCourse(courseId: string) {
        if (!window.confirm("Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.")) return;
        deleteCourseMutation.mutate(courseId);
    }

    // ── Module modal state ────────────────────────────────────────────
    const [moduleModalOpen, setModuleModalOpen] = useState(false);
    const [targetCourseId, setTargetCourseId] = useState("");
    const [editingModule, setEditingModule] = useState<CourseSummaryModule | undefined>(undefined);

    const addModuleMutation = useMutation({
        mutationFn: ({ courseId, data }: { courseId: string; data: AddModuleInput }) =>
            addModule(courseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Módulo adicionado!");
            setModuleModalOpen(false);
        },
        onError: () => toast.error("Erro ao adicionar módulo."),
    });

    const updateModuleMutation = useMutation({
        mutationFn: ({
            courseId,
            moduleId,
            data,
        }: {
            courseId: string;
            moduleId: string;
            data: UpdateModuleInput;
        }) => updateModule(courseId, moduleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Módulo atualizado!");
            setModuleModalOpen(false);
            setEditingModule(undefined);
        },
        onError: () => toast.error("Erro ao atualizar módulo."),
    });

    const deleteModuleMutation = useMutation({
        mutationFn: ({ courseId, moduleId }: { courseId: string; moduleId: string }) =>
            deleteModule(courseId, moduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Módulo removido.");
        },
        onError: () => toast.error("Erro ao remover módulo."),
    });

    function handleAddModule(courseId: string) {
        setTargetCourseId(courseId);
        setEditingModule(undefined);
        setModuleModalOpen(true);
    }

    function handleEditModule(courseId: string, mod: CourseSummaryModule) {
        setTargetCourseId(courseId);
        setEditingModule(mod);
        setModuleModalOpen(true);
    }

    function handleDeleteModule(courseId: string, moduleId: string) {
        if (!window.confirm("Remover este módulo?")) return;
        deleteModuleMutation.mutate({ courseId, moduleId });
    }

    function handleModuleSubmit(data: AddModuleInput | UpdateModuleInput) {
        if (editingModule) {
            updateModuleMutation.mutate({ courseId: targetCourseId, moduleId: editingModule.id, data });
        } else {
            addModuleMutation.mutate({ courseId: targetCourseId, data: data as AddModuleInput });
        }
    }

    // ── Quiz modal state ──────────────────────────────────────────────
    const [quizModalOpen, setQuizModalOpen] = useState(false);
    const [quizCourseId, setQuizCourseId] = useState("");
    const [quizModuleId, setQuizModuleId] = useState("");

    function handleOpenQuiz(courseId: string, moduleId: string) {
        setQuizCourseId(courseId);
        setQuizModuleId(moduleId);
        setQuizModalOpen(true);
    }

    // ── Render ────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-text-muted" />
                    <h2 className="text-base font-semibold text-text">Cursos</h2>
                </div>
                <Button size="sm" onClick={openCreateCourse} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Novo curso
                </Button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <BookOpen className="h-7 w-7 text-text-disabled mx-auto mb-2" />
                    <p className="text-sm text-text-muted">Nenhum curso cadastrado</p>
                    <p className="text-xs text-text-disabled mt-1">
                        Crie um curso para disponibilizar conteúdo aos participantes.
                    </p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {courses.map((course) => (
                        <li key={course.id}>
                            <CourseCard
                                course={course}
                                onEdit={openEditCourse}
                                onDelete={handleDeleteCourse}
                                onAddModule={handleAddModule}
                                onEditModule={handleEditModule}
                                onDeleteModule={handleDeleteModule}
                                onQuiz={handleOpenQuiz}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {/* Course Modal */}
            <CourseModal
                open={courseModalOpen}
                course={editingCourse}
                isPending={createCourseMutation.isPending || updateCourseMutation.isPending}
                onClose={() => {
                    setCourseModalOpen(false);
                    setEditingCourse(undefined);
                }}
                onSubmit={handleCourseSubmit}
            />

            {/* Module Modal */}
            <ModuleModal
                open={moduleModalOpen}
                mod={editingModule}
                isPending={addModuleMutation.isPending || updateModuleMutation.isPending}
                onClose={() => {
                    setModuleModalOpen(false);
                    setEditingModule(undefined);
                }}
                onSubmit={handleModuleSubmit}
            />

            {/* Quiz Editor Modal */}
            {quizModalOpen && (
                <QuizEditorModal
                    open={quizModalOpen}
                    courseId={quizCourseId}
                    moduleId={quizModuleId}
                    onClose={() => {
                        setQuizModalOpen(false);
                        queryClient.invalidateQueries({ queryKey });
                    }}
                />
            )}
        </div>
    );
}
