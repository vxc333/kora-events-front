import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  type EventMember,
  type MemberRole,
} from "@/services/members"

interface Props {
  eventId: string
}

const ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: "Administrador",
  CHECKIN: "Check-in",
  FINANCEIRO: "Financeiro",
}

const ROLE_BADGE_CLASSES: Record<MemberRole, string> = {
  ADMIN: "border-transparent bg-violet-100 text-violet-700",
  CHECKIN: "border-transparent bg-blue-100 text-blue-700",
  FINANCEIRO: "border-transparent bg-emerald-100 text-emerald-700",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("")
}

export function MembersTab({ eventId }: Props) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<MemberRole>("CHECKIN")

  const { data: members = [] } = useQuery({
    queryKey: ["members", eventId],
    queryFn: () => getMembers(eventId),
  })

  const inviteMutation = useMutation({
    mutationFn: () => inviteMember(eventId, { email: inviteEmail, role: inviteRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", eventId] })
      toast.success("Membro adicionado!")
      setInviteEmail("")
      setInviteRole("CHECKIN")
      setShowForm(false)
    },
    onError: () => toast.error("Erro ao adicionar membro."),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: MemberRole }) =>
      updateMemberRole(eventId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", eventId] })
      toast.success("Papel atualizado!")
    },
    onError: () => toast.error("Erro ao atualizar papel."),
  })

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(eventId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", eventId] })
      toast.success("Membro removido.")
    },
    onError: () => toast.error("Erro ao remover membro."),
  })

  const adminCount = members.filter((m) => m.role === "ADMIN").length

  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    inviteMutation.mutate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-text-muted" />
          <h2 className="text-base font-semibold text-text">Membros</h2>
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Adicionar membro
          </Button>
        )}
      </div>

      {/* Invite form */}
      {showForm && (
        <form
          onSubmit={handleInviteSubmit}
          className="rounded-xl border border-border bg-bg p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-text">Convidar membro</p>
          <div className="flex gap-2 flex-wrap">
            <input
              required
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="E-mail do usuário"
              className="h-9 flex-1 min-w-48 rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MemberRole)}
              className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
            >
              <option value="ADMIN">Administrador</option>
              <option value="CHECKIN">Check-in</option>
              <option value="FINANCEIRO">Financeiro</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setInviteEmail("")
                setInviteRole("CHECKIN")
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={inviteMutation.isPending}>
              Convidar
            </Button>
          </div>
        </form>
      )}

      {/* Members list */}
      {members.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <UserX className="h-7 w-7 text-text-disabled mx-auto mb-2" />
          <p className="text-sm text-text-muted">Nenhum membro adicionado.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {members.map((member: EventMember) => {
            const isLastAdmin = member.role === "ADMIN" && adminCount <= 1
            return (
              <li
                key={member.id}
                className="rounded-xl border border-border bg-bg p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar initials */}
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
                    style={{ backgroundColor: "#5B21B6" }}
                  >
                    {getInitials(member.user.name)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{member.user.name}</p>
                    <p className="text-xs text-text-muted truncate">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={ROLE_BADGE_CLASSES[member.role]}>
                    {ROLE_LABELS[member.role]}
                  </Badge>
                  <select
                    value={member.role}
                    onChange={(e) =>
                      updateRoleMutation.mutate({
                        memberId: member.id,
                        role: e.target.value as MemberRole,
                      })
                    }
                    className="h-8 rounded-md border border-border bg-bg px-2 text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="CHECKIN">Check-in</option>
                    <option value="FINANCEIRO">Financeiro</option>
                  </select>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isLastAdmin}
                    loading={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(member.id)}
                    title={isLastAdmin ? "Não é possível remover o único administrador" : undefined}
                  >
                    Remover
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
