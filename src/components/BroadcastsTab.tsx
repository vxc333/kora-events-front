import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBroadcasts, sendBroadcast } from "@/services/broadcasts";
import type { BroadcastSegment, CreateBroadcastInput } from "@/services/broadcasts";

interface Props {
    eventId: string;
}

const SEGMENT_LABELS: Record<BroadcastSegment, string> = {
    ALL: "Todos participantes",
    CONFIRMED: "Apenas confirmados",
    PENDING: "Apenas pendentes",
    CHECKED_IN: "Com check-in",
    NOT_CHECKED_IN: "Sem check-in",
};

const SEGMENT_BADGE: Record<BroadcastSegment, string> = {
    ALL: "bg-slate-100 text-slate-600",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    CHECKED_IN: "bg-blue-100 text-blue-700",
    NOT_CHECKED_IN: "bg-orange-100 text-orange-700",
};

function formatDatetime(iso: string): string {
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

interface ComposeForm {
    subject: string;
    body: string;
    segment: BroadcastSegment;
}

const EMPTY_FORM: ComposeForm = {
    subject: "",
    body: "",
    segment: "ALL",
};

export function BroadcastsTab({ eventId }: Props) {
    const queryClient = useQueryClient();
    const queryKey = ["broadcasts", eventId];

    const { data: broadcasts = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => getBroadcasts(eventId),
    });

    const sendMutation = useMutation({
        mutationFn: (data: CreateBroadcastInput) => sendBroadcast(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Mensagem enviada com sucesso!");
            setForm(EMPTY_FORM);
            setConfirming(false);
        },
        onError: () => {
            toast.error("Erro ao enviar mensagem.");
            setConfirming(false);
        },
    });

    const [form, setForm] = useState<ComposeForm>(EMPTY_FORM);
    const [confirming, setConfirming] = useState(false);

    function handleSendClick(e: React.FormEvent) {
        e.preventDefault();
        if (!form.subject.trim()) {
            toast.error("O assunto é obrigatório.");
            return;
        }
        if (form.body.trim().length < 10) {
            toast.error("A mensagem deve ter no mínimo 10 caracteres.");
            return;
        }
        setConfirming(true);
    }

    function handleConfirm() {
        sendMutation.mutate({
            subject: form.subject.trim(),
            body: form.body.trim(),
            segment: form.segment,
        });
    }

    const sortedBroadcasts = [...broadcasts].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return (
        <div className="p-6 bg-white rounded-xl border border-[#E4E0F0] space-y-6">
            {/* Compose card */}
            <div className="rounded-xl border border-[#E4E0F0] bg-[#FDFCFF] p-5 space-y-4">
                <h2 className="text-base font-semibold text-[#19162A]">Nova mensagem</h2>

                <form onSubmit={handleSendClick} className="space-y-4">
                    {/* Subject */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#6A6680]">
                            Assunto <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                            placeholder="Ex: Informações importantes sobre o evento"
                            className="h-9 w-full rounded-md border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#6A6680] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-1"
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#6A6680]">
                            Mensagem <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.body}
                            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                            placeholder="Digite sua mensagem aqui..."
                            rows={5}
                            className="w-full rounded-md border border-[#E4E0F0] bg-white px-3 py-2 text-sm text-[#19162A] placeholder:text-[#6A6680] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-1 resize-y"
                        />
                        <p className="text-[10px] text-[#6A6680]">Mínimo de 10 caracteres.</p>
                    </div>

                    {/* Segment */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#6A6680]">Segmento</label>
                        <select
                            value={form.segment}
                            onChange={(e) => setForm((f) => ({ ...f, segment: e.target.value as BroadcastSegment }))}
                            className="h-9 w-full rounded-md border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6] focus-visible:ring-offset-1"
                        >
                            {(Object.entries(SEGMENT_LABELS) as [BroadcastSegment, string][]).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Confirmation step */}
                    {confirming ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
                            <p className="text-sm text-amber-800">
                                Tem certeza? Isso enviará emails para todos os participantes no segmento selecionado.
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleConfirm}
                                    loading={sendMutation.isPending}
                                    className="gap-1.5"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Confirmar envio
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setConfirming(false)}
                                    disabled={sendMutation.isPending}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button type="submit" size="sm" className="gap-1.5">
                            <Send className="h-3.5 w-3.5" />
                            Enviar mensagem
                        </Button>
                    )}
                </form>
            </div>

            {/* History card */}
            <div className="rounded-xl border border-[#E4E0F0] bg-white p-5 space-y-4">
                <h2 className="text-base font-semibold text-[#19162A]">Histórico de envios</h2>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5B21B6] border-t-transparent" />
                    </div>
                ) : sortedBroadcasts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E4E0F0] p-8 text-center">
                        <Mail className="h-7 w-7 text-[#6A6680] mx-auto mb-2 opacity-40" />
                        <p className="text-sm text-[#6A6680]">Nenhuma mensagem enviada ainda.</p>
                    </div>
                ) : (
                    <ul className="space-y-2.5">
                        {sortedBroadcasts.map((broadcast) => (
                            <li key={broadcast.id} className="rounded-xl border border-[#E4E0F0] bg-[#FDFCFF] p-4 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-semibold text-[#19162A] leading-snug">{broadcast.subject}</p>
                                    <span
                                        className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${SEGMENT_BADGE[broadcast.segment]}`}
                                    >
                                        {SEGMENT_LABELS[broadcast.segment]}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#6A6680]">
                                    <span>
                                        {broadcast.recipientCount} destinatário{broadcast.recipientCount !== 1 ? "s" : ""}
                                    </span>
                                    <span>·</span>
                                    <span>{formatDatetime(broadcast.sentAt)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
