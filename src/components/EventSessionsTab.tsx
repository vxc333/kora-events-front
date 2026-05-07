import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  type EventSession,
  type CreateSessionInput,
} from "@/services/eventSessions"

interface Props {
  eventId: string
}

const EMPTY_FORM: CreateSessionInput = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
}

function formatDate(iso: string): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

export function EventSessionsTab({ eventId }: Props) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState<EventSession | null>(null)
  const [form, setForm] = useState<CreateSessionInput>(EMPTY_FORM)

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions", eventId],
    queryFn: () => getSessions(eventId),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateSessionInput) => createSession(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", eventId] })
      toast.success("Sessão criada com sucesso!")
      setShowForm(false)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error("Erro ao criar sessão."),
  })

  const updateMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: Partial<CreateSessionInput> }) =>
      updateSession(eventId, sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", eventId] })
      toast.success("Sessão atualizada!")
      setEditingSession(null)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error("Erro ao atualizar sessão."),
  })

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => deleteSession(eventId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", eventId] })
      toast.success("Sessão removida.")
    },
    onError: () => toast.error("Erro ao remover sessão."),
  })

  function openCreate() {
    setEditingSession(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(session: EventSession) {
    setEditingSession(session)
    setForm({
      title: session.title,
      description: session.description ?? "",
      startDate: session.startDate,
      endDate: session.endDate,
      startTime: session.startTime,
      endTime: session.endTime ?? "",
    })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingSession(null)
    setForm(EMPTY_FORM)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CreateSessionInput = {
      title: form.title,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime,
      ...(form.description ? { description: form.description } : {}),
      ...(form.endTime ? { endTime: form.endTime } : {}),
    }
    if (editingSession) {
      updateMutation.mutate({ sessionId: editingSession.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  async function handleDelete(session: EventSession) {
    if (!window.confirm(`Remover a sessão "${session.title}"?`)) return
    deleteMutation.mutate(session.id)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-text-muted" />
          <h2 className="text-base font-semibold text-text">Sessões</h2>
        </div>
        {!showForm && (
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Adicionar sessão
          </Button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-bg p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-text">
            {editingSession ? "Editar sessão" : "Nova sessão"}
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Título *</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="h-9 w-full rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                placeholder="Nome da sessão"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 resize-none"
                placeholder="Descrição opcional"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Data início *</label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="h-9 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Data fim *</label>
                <input
                  required
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="h-9 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Hora início *</label>
                <input
                  required
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="h-9 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Hora fim</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="h-9 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isPending}>
              {editingSession ? "Salvar" : "Criar sessão"}
            </Button>
          </div>
        </form>
      )}

      {/* Sessions list */}
      {sessions.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <CalendarDays className="h-7 w-7 text-text-disabled mx-auto mb-2" />
          <p className="text-sm text-text-muted">Nenhuma sessão cadastrada.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="rounded-xl border border-border bg-bg p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{session.title}</p>
                <p className="text-xs text-text-muted">
                  {formatDate(session.startDate)}
                  {session.startDate !== session.endDate && ` → ${formatDate(session.endDate)}`}
                  {" · "}
                  {session.startTime}
                  {session.endTime && ` – ${session.endTime}`}
                </p>
                <p className="text-xs text-text-muted">
                  {session.sessionCheckins.length} check-in{session.sessionCheckins.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(session)}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(session)}
                  loading={deleteMutation.isPending}
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
