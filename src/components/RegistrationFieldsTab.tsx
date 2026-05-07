import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    getRegistrationFields,
    createRegistrationField,
    updateRegistrationField,
    deleteRegistrationField,
} from "@/services/registrationFields";
import type { RegistrationField, FieldType, CreateFieldInput } from "@/services/registrationFields";

interface Props {
    eventId: string;
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    TEXT: "Texto livre",
    SELECT: "Lista de opções",
    CHECKBOX: "Caixa de seleção",
    RADIO: "Botões de opção",
};

const FIELD_TYPE_BADGE: Record<FieldType, string> = {
    TEXT: "bg-slate-100 text-slate-600",
    SELECT: "bg-blue-100 text-blue-700",
    CHECKBOX: "bg-green-100 text-green-700",
    RADIO: "bg-violet-100 text-violet-700",
};

const HAS_OPTIONS: FieldType[] = ["SELECT", "RADIO"];

interface FieldForm {
    label: string;
    type: FieldType;
    required: boolean;
    optionsRaw: string; // one per line
}

const EMPTY_FORM: FieldForm = {
    label: "",
    type: "TEXT",
    required: false,
    optionsRaw: "",
};

function fieldToForm(f: RegistrationField): FieldForm {
    return {
        label: f.label,
        type: f.type,
        required: f.required,
        optionsRaw: f.options ? f.options.join("\n") : "",
    };
}

function formToInput(form: FieldForm, order: number): CreateFieldInput {
    const input: CreateFieldInput = {
        label: form.label.trim(),
        type: form.type,
        required: form.required,
        order,
    };
    if (HAS_OPTIONS.includes(form.type)) {
        input.options = form.optionsRaw
            .split("\n")
            .map((o) => o.trim())
            .filter(Boolean);
    }
    return input;
}

export function RegistrationFieldsTab({ eventId }: Props) {
    const queryClient = useQueryClient();
    const queryKey = ["registration-fields", eventId];

    const { data: fields = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => getRegistrationFields(eventId),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateFieldInput) => createRegistrationField(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Campo adicionado!");
            setMode("idle");
        },
        onError: () => toast.error("Erro ao adicionar campo."),
    });

    const updateMutation = useMutation({
        mutationFn: ({ fieldId, data }: { fieldId: string; data: CreateFieldInput }) => updateRegistrationField(eventId, fieldId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Campo atualizado!");
            setMode("idle");
        },
        onError: () => toast.error("Erro ao atualizar campo."),
    });

    const deleteMutation = useMutation({
        mutationFn: (fieldId: string) => deleteRegistrationField(eventId, fieldId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Campo removido.");
        },
        onError: () => toast.error("Erro ao remover campo."),
    });

    type Mode = "idle" | "create" | { editing: RegistrationField };
    const [mode, setMode] = useState<Mode>("idle");
    const [form, setForm] = useState<FieldForm>(EMPTY_FORM);

    function openCreate() {
        setForm(EMPTY_FORM);
        setMode("create");
    }

    function openEdit(field: RegistrationField) {
        setForm(fieldToForm(field));
        setMode({ editing: field });
    }

    function closeForm() {
        setMode("idle");
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.label.trim()) {
            toast.error("O rótulo do campo é obrigatório.");
            return;
        }

        if (mode === "create") {
            const order = fields.length + 1;
            createMutation.mutate(formToInput(form, order));
        } else if (typeof mode === "object" && "editing" in mode) {
            updateMutation.mutate({
                fieldId: mode.editing.id,
                data: formToInput(form, mode.editing.order),
            });
        }
    }

    function handleDelete(field: RegistrationField) {
        if (window.confirm(`Remover o campo "${field.label}"?`)) {
            deleteMutation.mutate(field.id);
        }
    }

    const isMutating = createMutation.isPending || updateMutation.isPending;
    const isFormOpen = mode === "create" || (typeof mode === "object" && "editing" in mode);
    const editingId = typeof mode === "object" && "editing" in mode ? mode.editing.id : null;

    return (
        <div className="p-6 bg-white rounded-xl border border-[#E4E0F0] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-[#19162A]">Campos personalizados</h2>
                    <p className="text-xs text-[#6A6680] mt-0.5">Campos exibidos no formulário de inscrição do evento</p>
                </div>
                {!isFormOpen && (
                    <Button size="sm" onClick={openCreate} className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar campo
                    </Button>
                )}
            </div>

            {/* Inline form */}
            {isFormOpen && (
                <form onSubmit={handleSubmit} className="rounded-xl border border-[#E4E0F0] bg-[#FDFCFF] p-4 space-y-4">
                    <p className="text-sm font-medium text-[#19162A]">{mode === "create" ? "Novo campo" : "Editar campo"}</p>

                    {/* Label */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#6A6680]">
                            Rótulo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.label}
                            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                            placeholder="Ex: Número de documento, Tamanho da camiseta..."
                            className="h-9 w-full rounded-md border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#6A6680] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-1"
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#6A6680]">Tipo</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FieldType }))}
                            className="h-9 w-full rounded-md border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-1"
                        >
                            {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][]).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Required */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={form.required}
                            onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
                            className="h-4 w-4 rounded border-[#E4E0F0] accent-[#5B21B6]"
                        />
                        <span className="text-sm text-[#19162A]">Campo obrigatório</span>
                    </label>

                    {/* Options — only for SELECT and RADIO */}
                    {HAS_OPTIONS.includes(form.type) && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#6A6680]">
                                Opções <span className="font-normal text-[#6A6680]">— Separe as opções com Enter</span>
                            </label>
                            <textarea
                                value={form.optionsRaw}
                                onChange={(e) => setForm((f) => ({ ...f, optionsRaw: e.target.value }))}
                                placeholder={"Opção 1\nOpção 2\nOpção 3"}
                                rows={4}
                                className="w-full rounded-md border border-[#E4E0F0] bg-white px-3 py-2 text-sm text-[#19162A] placeholder:text-[#6A6680] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-1 resize-y"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        <Button type="submit" size="sm" loading={isMutating}>
                            {mode === "create" ? "Adicionar" : "Salvar alterações"}
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={closeForm}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            {/* Field list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5B21B6] border-t-transparent" />
                </div>
            ) : fields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E4E0F0] p-8 text-center">
                    <p className="text-sm text-[#6A6680]">Nenhum campo personalizado ainda.</p>
                    <p className="text-xs text-[#6A6680] mt-1">Adicione campos para coletar mais informações dos participantes.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {[...fields]
                        .sort((a, b) => a.order - b.order)
                        .map((field) => (
                            <li
                                key={field.id}
                                className={`group rounded-xl border bg-white p-3.5 flex items-center gap-3 transition-colors ${
                                    editingId === field.id ? "border-[#5B21B6]" : "border-[#E4E0F0] hover:border-[#5B21B6]/40"
                                }`}
                            >
                                {/* Drag hint */}
                                <div className="flex-shrink-0 flex items-center gap-1.5 text-[#6A6680]">
                                    <GripVertical className="h-4 w-4 opacity-40" />
                                    <span className="text-xs font-medium tabular-nums w-4 text-center">{field.order}</span>
                                </div>

                                {/* Field info */}
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-[#19162A]">{field.label}</span>
                                        {field.required && <span className="text-[10px] font-medium text-red-500">obrigatório</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${FIELD_TYPE_BADGE[field.type]}`}
                                        >
                                            {FIELD_TYPE_LABELS[field.type]}
                                        </span>
                                        {field.options && field.options.length > 0 && (
                                            <span className="text-[10px] text-[#6A6680] truncate max-w-xs">
                                                {field.options.join(" · ")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" size="sm" onClick={() => openEdit(field)} className="h-7 w-7 p-0">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(field)}
                                        disabled={deleteMutation.isPending}
                                        className="h-7 w-7 p-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
