import { useRef, useState } from "react";
import { getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Link, useParams } from "react-router-dom";
import {
    ChevronRight,
    CalendarDays,
    Clock,
    MapPin,
    Wifi,
    Clock3,
    TicketIcon,
    Image,
    Pencil,
    X,
    Megaphone,
    Plus,
    Users,
    Tag,
    Building2,
    Search,
    Upload,
    Download,
    PenLine,
    FileDown,
    QrCode,
    Award,
    ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketFormModal } from "@/components/TicketFormModal";
import { CouponFormModal } from "@/components/CouponFormModal";
import { PartnerFormModal } from "@/components/PartnerFormModal";
import { ParticipantFormModal } from "@/components/ParticipantFormModal";
import { SignerFormModal } from "@/components/SignerFormModal";
import { CertificateStudioTab } from "@/components/CertificateStudioTab";
import {
    useEvent,
    usePublishEvent,
    useCancelEvent,
    useUploadEventImage,
    useDownloadAttendanceReport,
    useUpdatePageBuilder,
} from "@/hooks/useEvent";
import { PageBuilderTab } from "@/components/PageBuilderTab";
import { RegistrationFieldsTab } from "@/components/RegistrationFieldsTab";
import { BroadcastsTab } from "@/components/BroadcastsTab";
import { useTickets, useCreateTicket, useUpdateTicket, useDeleteTicket } from "@/hooks/useTickets";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeactivateCoupon } from "@/hooks/useCoupons";
import {
    useParticipants,
    useCreateParticipant,
    useUpdateParticipant,
    useCancelParticipant,
    useImportParticipantsCsv,
} from "@/hooks/useParticipants";
import { exportParticipantsCsv, downloadParticipantCertificate } from "@/services/participants";
import { usePartners, useCreatePartner, useUpdatePartner, useDeletePartner, useUploadPartnerLogo } from "@/hooks/usePartners";
import { useSigners, useCreateSigner, useUpdateSigner, useDeleteSigner, useUploadSignerSignature } from "@/hooks/useSigners";
import { useConfirm } from "@/hooks/useConfirm";
import type { EventStatus } from "@/types/events";
import type { Ticket, CreateTicketInput } from "@/types/tickets";
import type { Coupon, CreateCouponInput } from "@/types/coupons";
import type { EventPartner, CreatePartnerInput } from "@/types/partners";
import type { Participant, ParticipantStatus } from "@/types/participants";
import type { CertificateSigner, CreateSignerInput } from "@/types/signers";
import type { ParticipantFormOutput } from "@/components/ParticipantFormModal";

const STATUS_LABELS: Record<EventStatus, string> = {
    DRAFT: "Rascunho",
    PUBLISHED: "Publicado",
    ONGOING: "Em andamento",
    FINISHED: "Finalizado",
    CANCELLED: "Cancelado",
};

const STATUS_CLASSES: Record<EventStatus, string> = {
    DRAFT: "border-transparent bg-slate-100 text-slate-600",
    PUBLISHED: "border-transparent bg-violet-100 text-violet-700",
    ONGOING: "border-transparent bg-emerald-100 text-emerald-700",
    FINISHED: "border-transparent bg-blue-100 text-blue-700",
    CANCELLED: "border-transparent bg-red-100 text-red-600",
};

const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
};

const PARTICIPANT_STATUS_CLASSES: Record<ParticipantStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-600",
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(value: number): string {
    if (value === 0) return "Gratuito";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

type TabId =
    | "details"
    | "tickets"
    | "participants"
    | "campos"
    | "coupons"
    | "partners"
    | "signers"
    | "certificate"
    | "page"
    | "comunicacao";

const TABS: Array<{ id: TabId; label: string }> = [
    { id: "details", label: "Detalhes" },
    { id: "tickets", label: "Ingressos" },
    { id: "participants", label: "Participantes" },
    { id: "campos", label: "Campos" },
    { id: "coupons", label: "Cupons" },
    { id: "partners", label: "Parceiros" },
    { id: "signers", label: "Assinantes" },
    { id: "certificate", label: "Certificado" },
    { id: "page", label: "Página" },
    { id: "comunicacao", label: "Comunicação" },
];

export function EventDetailPage() {
    const { id = "" } = useParams<{ id: string }>();
    const { event, isLoading } = useEvent(id);
    const { publish, isPending: isPublishing } = usePublishEvent(id);
    const { cancel, isPending: isCancelling } = useCancelEvent(id);
    const { upload, isPending: isUploading } = useUploadEventImage(id);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    // Tickets
    const { tickets } = useTickets(id);
    const { createTicket, isPending: isCreatingTicket } = useCreateTicket(id);
    const { updateTicket, isPending: isUpdatingTicket } = useUpdateTicket(id);
    const { deleteTicket } = useDeleteTicket(id);

    // Coupons
    const { coupons } = useCoupons(id);
    const { createCoupon, isPending: isCreatingCoupon } = useCreateCoupon(id);
    const { updateCoupon, isPending: isUpdatingCoupon } = useUpdateCoupon(id);
    const { deactivateCoupon } = useDeactivateCoupon(id);

    // Participants
    const [participantSearch, setParticipantSearch] = useState("");
    const [participantStatusFilter, setParticipantStatusFilter] = useState<ParticipantStatus | undefined>(undefined);
    const { participants, total: participantsTotal } = useParticipants(id, {
        search: participantSearch || undefined,
        status: participantStatusFilter,
        limit: 20,
    });
    const { createParticipant, isPending: isCreatingParticipant } = useCreateParticipant(id);
    const { updateParticipant, isPending: isUpdatingParticipant } = useUpdateParticipant(id);
    const { cancelParticipant } = useCancelParticipant(id);
    const { importCsv, isPending: isImportingCsv } = useImportParticipantsCsv(id);

    // Partners
    const { partners } = usePartners(id);
    const { createPartner, isPending: isCreatingPartner } = useCreatePartner(id);
    const { updatePartner, isPending: isUpdatingPartner } = useUpdatePartner(id);
    const { deletePartner } = useDeletePartner(id);
    const { uploadLogo, isPending: isUploadingLogo } = useUploadPartnerLogo(id);
    const [activeLogoPartnerId, setActiveLogoPartnerId] = useState<string | null>(null);

    // Signers
    const { signers } = useSigners(id);
    const { createSigner, isPending: isCreatingSigner } = useCreateSigner(id);
    const { updateSigner, isPending: isUpdatingSigner } = useUpdateSigner(id);
    const { deleteSigner } = useDeleteSigner(id);
    const { uploadSignature, isPending: isUploadingSignature } = useUploadSignerSignature(id);
    const [activeSignatureSignerId, setActiveSignatureSignerId] = useState<string | null>(null);

    // Attendance report
    const { downloadReport, isPending: isDownloadingReport } = useDownloadAttendanceReport(id);

    const [downloadingCertParticipantId, setDownloadingCertParticipantId] = useState<string | null>(null);

    async function handleDownloadCertificate(p: Participant) {
        setDownloadingCertParticipantId(p.id);
        try {
            await downloadParticipantCertificate(p.id, p.name);
        } catch {
            toast.error("Erro ao gerar certificado.");
        } finally {
            setDownloadingCertParticipantId(null);
        }
    }

    // Page builder
    const { savePage, isPending: isSavingPage } = useUpdatePageBuilder(id);

    // Confirm dialog
    const { confirm, ConfirmDialogNode } = useConfirm();

    // Tab state
    const [activeTab, setActiveTab] = useState<TabId>("details");

    // Modal state — tickets
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | undefined>(undefined);

    // Modal state — coupons
    const [couponModalOpen, setCouponModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);

    // Modal state — participants
    const [participantModalOpen, setParticipantModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | undefined>(undefined);

    // Modal state — partners
    const [partnerModalOpen, setPartnerModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<EventPartner | undefined>(undefined);

    // Modal state — signers
    const [signerModalOpen, setSignerModalOpen] = useState(false);
    const [editingSigner, setEditingSigner] = useState<CertificateSigner | undefined>(undefined);

    function openCreateTicketModal() {
        setEditingTicket(undefined);
        setTicketModalOpen(true);
    }
    function openEditTicketModal(ticket: Ticket) {
        setEditingTicket(ticket);
        setTicketModalOpen(true);
    }
    function closeTicketModal() {
        setTicketModalOpen(false);
        setEditingTicket(undefined);
    }
    function handleTicketSubmit(data: CreateTicketInput) {
        if (editingTicket) {
            updateTicket({ ticketId: editingTicket.id, data });
        } else {
            createTicket(data);
        }
        closeTicketModal();
    }

    function openCreateCouponModal() {
        setEditingCoupon(undefined);
        setCouponModalOpen(true);
    }
    function openEditCouponModal(coupon: Coupon) {
        setEditingCoupon(coupon);
        setCouponModalOpen(true);
    }
    function closeCouponModal() {
        setCouponModalOpen(false);
        setEditingCoupon(undefined);
    }
    function handleCouponSubmit(data: CreateCouponInput) {
        if (editingCoupon) {
            updateCoupon({ couponId: editingCoupon.id, data });
        } else {
            createCoupon(data);
        }
        closeCouponModal();
    }

    function openCreateParticipantModal() {
        setEditingParticipant(undefined);
        setParticipantModalOpen(true);
    }
    function openEditParticipantModal(p: Participant) {
        setEditingParticipant(p);
        setParticipantModalOpen(true);
    }
    function closeParticipantModal() {
        setParticipantModalOpen(false);
        setEditingParticipant(undefined);
    }
    function handleParticipantSubmit(data: ParticipantFormOutput) {
        if (editingParticipant) {
            updateParticipant({ participantId: editingParticipant.id, data });
        } else {
            createParticipant({ name: data.name, email: data.email, cpf: data.cpf, ticketId: data.ticketId });
        }
        closeParticipantModal();
    }

    function openCreatePartnerModal() {
        setEditingPartner(undefined);
        setPartnerModalOpen(true);
    }
    function openEditPartnerModal(p: EventPartner) {
        setEditingPartner(p);
        setPartnerModalOpen(true);
    }
    function closePartnerModal() {
        setPartnerModalOpen(false);
        setEditingPartner(undefined);
    }
    function handlePartnerSubmit(data: CreatePartnerInput) {
        if (editingPartner) {
            updatePartner({ partnerId: editingPartner.id, data });
        } else {
            createPartner(data);
        }
        closePartnerModal();
    }

    function openCreateSignerModal() {
        setEditingSigner(undefined);
        setSignerModalOpen(true);
    }
    function openEditSignerModal(s: CertificateSigner) {
        setEditingSigner(s);
        setSignerModalOpen(true);
    }
    function closeSignerModal() {
        setSignerModalOpen(false);
        setEditingSigner(undefined);
    }
    function handleSignerSubmit(data: CreateSignerInput) {
        if (editingSigner) {
            updateSigner({ signerId: editingSigner.id, data });
        } else {
            createSigner(data);
        }
        closeSignerModal();
    }

    if (isLoading) {
        return (
            <div data-testid="detail-skeleton" className="p-8 space-y-5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-9 w-80" />
                <Skeleton className="h-52 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    if (!event) return null;

    const canPublish = event.status === "DRAFT";
    const canCancel = event.status !== "CANCELLED" && event.status !== "FINISHED";

    return (
        <div className={`p-8 space-y-7`}>
            {ConfirmDialogNode}
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-text-muted">
                <Link to="/dashboard" className="hover:text-text transition-colors">
                    Meus eventos
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-text">Detalhes do evento</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                    <h1 className="text-3xl text-text leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        {event.title}
                    </h1>
                    <Badge className={STATUS_CLASSES[event.status]}>{STATUS_LABELS[event.status]}</Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                    <a href={`/e/${event.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="sm" className="gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver página
                        </Button>
                    </a>
                    <Link to={`/checkin/${id}`}>
                        <Button variant="secondary" size="sm" className="gap-1.5">
                            <QrCode className="h-3.5 w-3.5" />
                            Check-in
                        </Button>
                    </Link>
                    <Link to={`/events/${id}/edit`}>
                        <Button variant="secondary" size="sm" className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                        </Button>
                    </Link>
                    {canPublish && (
                        <Button size="sm" onClick={() => publish()} loading={isPublishing} className="gap-1.5">
                            <Megaphone className="h-3.5 w-3.5" />
                            Publicar
                        </Button>
                    )}
                    {canCancel && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={async () => {
                                if (
                                    await confirm({
                                        title: "Cancelar este evento?",
                                        description: "Esta ação não pode ser desfeita.",
                                        confirmLabel: "Cancelar evento",
                                        variant: "danger",
                                    })
                                )
                                    cancel();
                            }}
                            loading={isCancelling}
                            className="gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="flex gap-1 -mb-px">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={
                                activeTab === tab.id
                                    ? "px-4 py-2.5 text-sm font-medium text-brand border-b-2 border-brand -mb-px cursor-pointer transition-colors"
                                    : "px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text border-b-2 border-transparent -mb-px cursor-pointer transition-colors"
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab: Detalhes */}
            {activeTab === "details" && (
                <div className="space-y-6">
                    {/* Banner */}
                    <div className="space-y-2">
                        <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl bg-bg-muted border border-border">
                            {event.bannerUrl ? (
                                <img src={getMediaUrl(event.bannerUrl)!} alt="Banner" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-text-disabled">
                                    <Image className="h-8 w-8" />
                                    <span className="text-xs">Sem banner</span>
                                </div>
                            )}
                        </div>
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) upload({ type: "banner", file });
                            }}
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            loading={isUploading}
                            onClick={() => bannerInputRef.current?.click()}
                            className="gap-1.5"
                        >
                            <Image className="h-3.5 w-3.5" />
                            Alterar banner
                        </Button>
                    </div>

                    {/* Info grid */}
                    <div className="rounded-xl border border-border bg-bg overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                            <div className="p-4 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Data de início
                                </div>
                                <p className="text-sm font-medium text-text">{formatDate(event.startDate)}</p>
                                <div className="flex items-center gap-1 text-xs text-text-muted">
                                    <Clock className="h-3 w-3" />
                                    {event.startTime}
                                </div>
                            </div>
                            <div className="p-4 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Data de término
                                </div>
                                <p className="text-sm font-medium text-text">{formatDate(event.endDate)}</p>
                                <div className="flex items-center gap-1 text-xs text-text-muted">
                                    <Clock className="h-3 w-3" />
                                    {event.endTime}
                                </div>
                            </div>
                        </div>
                        <div
                            className={`grid divide-x divide-border border-b border-border ${event.workloadHours != null ? "grid-cols-2" : "grid-cols-1"}`}
                        >
                            <div className="p-4">
                                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                                    {event.isOnline ? <Wifi className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                                    Local
                                </div>
                                <p className="text-sm font-medium text-text">{event.isOnline ? "Online" : (event.location ?? "—")}</p>
                            </div>
                            {event.workloadHours != null && (
                                <div className="p-4">
                                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        Carga horária
                                    </div>
                                    <p className="text-sm font-medium text-text">{event.workloadHours}h</p>
                                </div>
                            )}
                        </div>
                        {event.description && (
                            <div className="p-4">
                                <p className="text-xs text-text-muted mb-2">Descrição</p>
                                <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{event.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Attendance report */}
                    <div className="flex items-center justify-between rounded-xl border border-border bg-bg p-4">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-text">Relatório de presença</p>
                            <p className="text-xs text-text-muted">PDF com lista de participantes confirmados e check-ins</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            loading={isDownloadingReport}
                            onClick={() => downloadReport()}
                            className="gap-1.5 flex-shrink-0"
                        >
                            <FileDown className="h-3.5 w-3.5" />
                            Baixar PDF
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab: Ingressos */}
            {activeTab === "tickets" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TicketIcon className="h-4 w-4 text-text-muted" />
                            <h2 className="text-base font-semibold text-text">Ingressos</h2>
                        </div>
                        <Button size="sm" onClick={openCreateTicketModal} className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Adicionar ingresso
                        </Button>
                    </div>

                    {tickets.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <TicketIcon className="h-7 w-7 text-text-disabled mx-auto mb-2" />
                            <p className="text-sm text-text-muted">Nenhum ingresso cadastrado</p>
                        </div>
                    ) : (
                        <ul className="space-y-2.5">
                            {tickets.map((ticket) => (
                                <li
                                    key={ticket.id}
                                    className="rounded-xl border border-border bg-bg p-4 flex items-center justify-between gap-4"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-text">{ticket.name}</p>
                                            {!ticket.isActive && (
                                                <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                                    inativo
                                                </span>
                                            )}
                                            {ticket.isHalfPrice && (
                                                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                                    Meia-entrada
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            <span className="font-medium text-text">{formatCurrency(ticket.price)}</span>
                                            {" · "}
                                            {ticket.quantitySold}/{ticket.quantity ?? "∞"} vendidos
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button variant="secondary" size="sm" onClick={() => openEditTicketModal(ticket)}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                if (
                                                    await confirm({
                                                        title: "Remover ingresso?",
                                                        description: `O lote "${ticket.name}" será removido permanentemente.`,
                                                        confirmLabel: "Remover",
                                                        variant: "danger",
                                                    })
                                                )
                                                    deleteTicket(ticket.id);
                                            }}
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Tab: Participantes */}
            {activeTab === "participants" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-text-muted" />
                            <h2 className="text-base font-semibold text-text">
                                Participantes
                                {participantsTotal > 0 && (
                                    <span className="ml-2 text-xs font-normal text-text-muted">({participantsTotal})</span>
                                )}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                ref={csvInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) importCsv(file);
                                    if (csvInputRef.current) csvInputRef.current.value = "";
                                }}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => exportParticipantsCsv(id, event?.title ?? id)}
                                className="gap-1.5"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Exportar CSV
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                loading={isImportingCsv}
                                onClick={() => csvInputRef.current?.click()}
                                className="gap-1.5"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Importar CSV
                            </Button>
                            <Button size="sm" onClick={openCreateParticipantModal} className="gap-1.5">
                                <Plus className="h-3.5 w-3.5" />
                                Adicionar participante
                            </Button>
                        </div>
                    </div>

                    {/* Search + filter */}
                    <div className="flex gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                            <input
                                type="search"
                                placeholder="Buscar por nome ou e-mail..."
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                                className="h-9 w-full rounded-md border border-border bg-bg pl-8 pr-3 text-sm text-text placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            {([undefined, "PENDING", "CONFIRMED", "CANCELLED"] as (ParticipantStatus | undefined)[]).map((s) => (
                                <button
                                    key={String(s)}
                                    onClick={() => setParticipantStatusFilter(s)}
                                    className={
                                        participantStatusFilter === s
                                            ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-brand text-white cursor-pointer transition-colors"
                                            : "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-bg border border-border text-text-muted hover:text-text cursor-pointer transition-colors"
                                    }
                                >
                                    {s ? PARTICIPANT_STATUS_LABELS[s] : "Todos"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {participants.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <Users className="h-7 w-7 text-text-disabled mx-auto mb-2" />
                            <p className="text-sm text-text-muted">Nenhum participante encontrado</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {participants.map((p) => (
                                <li
                                    key={p.id}
                                    className="rounded-xl border border-border bg-bg p-4 flex items-center justify-between gap-4"
                                >
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-sm font-semibold text-text truncate">{p.name}</p>
                                        <p className="text-xs text-text-muted truncate">{p.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span
                                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PARTICIPANT_STATUS_CLASSES[p.status]}`}
                                        >
                                            {PARTICIPANT_STATUS_LABELS[p.status]}
                                        </span>
                                        <Button variant="secondary" size="sm" onClick={() => openEditParticipantModal(p)}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={p.certificateReleased}
                                            onClick={() => updateParticipant({ participantId: p.id, data: { certificateReleased: true } })}
                                        >
                                            <Award className="h-3.5 w-3.5 mr-1" />
                                            {p.certificateReleased ? "Liberado" : "Liberar"}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            loading={downloadingCertParticipantId === p.id}
                                            onClick={() => handleDownloadCertificate(p)}
                                            className="gap-1.5"
                                        >
                                            <FileDown className="h-3.5 w-3.5" />
                                            Certificado
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                if (
                                                    await confirm({
                                                        title: "Cancelar inscrição?",
                                                        description: `A inscrição de ${p.name} será cancelada.`,
                                                        confirmLabel: "Cancelar inscrição",
                                                        variant: "danger",
                                                    })
                                                )
                                                    cancelParticipant(p.id);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Tab: Cupons */}
            {activeTab === "coupons" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-text-muted" />
                            <h2 className="text-base font-semibold text-text">Cupons</h2>
                        </div>
                        <Button size="sm" onClick={openCreateCouponModal} className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Adicionar cupom
                        </Button>
                    </div>

                    {coupons.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <Tag className="h-7 w-7 text-text-disabled mx-auto mb-2" />
                            <p className="text-sm text-text-muted">Nenhum cupom cadastrado</p>
                        </div>
                    ) : (
                        <ul className="space-y-2.5">
                            {coupons.map((coupon) => (
                                <li
                                    key={coupon.id}
                                    className="rounded-xl border border-border bg-bg p-4 flex items-center justify-between gap-4"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-text font-mono tracking-wide">{coupon.code}</p>
                                            {!coupon.isActive && (
                                                <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                                    inativo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            {coupon.discountType === "PERCENTAGE"
                                                ? `${coupon.discountValue}% de desconto`
                                                : `${formatCurrency(coupon.discountValue)} de desconto`}
                                            {" · "}
                                            {coupon.usedCount}/{coupon.maxUses ?? "∞"} usos
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button variant="secondary" size="sm" onClick={() => openEditCouponModal(coupon)}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                if (
                                                    await confirm({
                                                        title: "Desativar cupom?",
                                                        description: `O cupom "${coupon.code}" não poderá mais ser utilizado.`,
                                                        confirmLabel: "Desativar",
                                                        variant: "warning",
                                                    })
                                                )
                                                    deactivateCoupon(coupon.id);
                                            }}
                                        >
                                            Desativar
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Tab: Parceiros */}
            {activeTab === "partners" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-text-muted" />
                            <h2 className="text-base font-semibold text-text">Parceiros</h2>
                        </div>
                        <Button size="sm" onClick={openCreatePartnerModal} className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Adicionar parceiro
                        </Button>
                    </div>

                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && activeLogoPartnerId) {
                                uploadLogo({ partnerId: activeLogoPartnerId, file });
                            }
                            if (logoInputRef.current) logoInputRef.current.value = "";
                        }}
                    />

                    {partners.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <Building2 className="h-7 w-7 text-text-disabled mx-auto mb-2" />
                            <p className="text-sm text-text-muted">Nenhum parceiro cadastrado</p>
                        </div>
                    ) : (
                        <ul className="space-y-2.5">
                            {partners.map((partner) => (
                                <li
                                    key={partner.id}
                                    className="rounded-xl border border-border bg-bg p-4 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {partner.logoUrl ? (
                                            <img
                                                src={getMediaUrl(partner.logoUrl)!}
                                                alt={partner.name}
                                                className="h-10 w-10 rounded-md object-contain border border-border bg-bg-muted flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-md border border-dashed border-border bg-bg-muted flex items-center justify-center flex-shrink-0">
                                                <Building2 className="h-4 w-4 text-text-disabled" />
                                            </div>
                                        )}
                                        <p className="text-sm font-semibold text-text truncate">{partner.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            loading={isUploadingLogo && activeLogoPartnerId === partner.id}
                                            onClick={() => {
                                                setActiveLogoPartnerId(partner.id);
                                                logoInputRef.current?.click();
                                            }}
                                            className="gap-1.5"
                                        >
                                            <Image className="h-3 w-3" />
                                            Logo
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => openEditPartnerModal(partner)}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                if (
                                                    await confirm({
                                                        title: "Remover parceiro?",
                                                        description: `O parceiro "${partner.name}" será removido do evento.`,
                                                        confirmLabel: "Remover",
                                                        variant: "danger",
                                                    })
                                                )
                                                    deletePartner(partner.id);
                                            }}
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Tab: Assinantes */}
            {activeTab === "signers" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PenLine className="h-4 w-4 text-text-muted" />
                            <h2 className="text-base font-semibold text-text">Assinantes</h2>
                            <span className="text-xs text-text-muted">{signers.length}/5</span>
                        </div>
                        <Button size="sm" onClick={openCreateSignerModal} disabled={signers.length >= 5} className="gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Adicionar assinante
                        </Button>
                    </div>

                    <input
                        ref={signatureInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && activeSignatureSignerId) {
                                uploadSignature({ signerId: activeSignatureSignerId, file });
                            }
                            if (signatureInputRef.current) signatureInputRef.current.value = "";
                        }}
                    />

                    {signers.length === 5 && (
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            Limite de 5 assinantes atingido. Remova um para adicionar outro.
                        </p>
                    )}

                    {signers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <PenLine className="h-7 w-7 text-text-disabled mx-auto mb-2" />
                            <p className="text-sm text-text-muted">Nenhum assinante cadastrado</p>
                            <p className="text-xs text-text-disabled mt-1">Os assinantes aparecem no rodapé do certificado</p>
                        </div>
                    ) : (
                        <ul className="space-y-2.5">
                            {signers.map((signer) => (
                                <li
                                    key={signer.id}
                                    className="rounded-xl border border-border bg-bg p-4 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="flex-shrink-0 w-24 h-10 rounded-md border border-border bg-bg-muted flex items-center justify-center overflow-hidden">
                                            {signer.signatureUrl ? (
                                                <img
                                                    src={getMediaUrl(signer.signatureUrl)!}
                                                    alt="Assinatura"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-[10px] text-text-disabled">sem assinatura</span>
                                            )}
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <p className="text-sm font-semibold text-text truncate">{signer.name}</p>
                                            <p className="text-xs text-text-muted truncate">{signer.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            loading={isUploadingSignature && activeSignatureSignerId === signer.id}
                                            onClick={() => {
                                                setActiveSignatureSignerId(signer.id);
                                                signatureInputRef.current?.click();
                                            }}
                                            className="gap-1.5"
                                        >
                                            <Upload className="h-3 w-3" />
                                            Assinatura
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => openEditSignerModal(signer)}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                if (
                                                    await confirm({
                                                        title: "Remover assinante?",
                                                        description: `${signer.name} será removido da lista de assinantes.`,
                                                        confirmLabel: "Remover",
                                                        variant: "danger",
                                                    })
                                                )
                                                    deleteSigner(signer.id);
                                            }}
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Tab: Certificado */}
            {activeTab === "certificate" && <CertificateStudioTab eventId={id} event={event} signers={signers} />}

            {/* Tab: Página */}
            {activeTab === "page" && (
                <PageBuilderTab
                    eventId={id}
                    slug={event.slug}
                    initialBlocks={event.pageBlocks}
                    initialSettings={event.pageSettings}
                    onSave={(blocks, settings) => savePage({ pageBlocks: blocks, pageSettings: settings })}
                    isSaving={isSavingPage}
                />
            )}

            {/* Tab: Campos */}
            {activeTab === "campos" && <RegistrationFieldsTab eventId={id} />}

            {/* Tab: Comunicação */}
            {activeTab === "comunicacao" && <BroadcastsTab eventId={id} />}

            {/* Modals */}
            <TicketFormModal
                open={ticketModalOpen}
                ticket={editingTicket}
                isPending={isCreatingTicket || isUpdatingTicket}
                onClose={closeTicketModal}
                onSubmit={handleTicketSubmit}
            />
            <CouponFormModal
                open={couponModalOpen}
                coupon={editingCoupon}
                isPending={isCreatingCoupon || isUpdatingCoupon}
                onClose={closeCouponModal}
                onSubmit={handleCouponSubmit}
            />
            <ParticipantFormModal
                open={participantModalOpen}
                participant={editingParticipant}
                tickets={tickets}
                isPending={isCreatingParticipant || isUpdatingParticipant}
                onClose={closeParticipantModal}
                onSubmit={handleParticipantSubmit}
            />
            <PartnerFormModal
                open={partnerModalOpen}
                partner={editingPartner}
                isPending={isCreatingPartner || isUpdatingPartner}
                onClose={closePartnerModal}
                onSubmit={handlePartnerSubmit}
            />
            <SignerFormModal
                open={signerModalOpen}
                signer={editingSigner}
                isPending={isCreatingSigner || isUpdatingSigner}
                onClose={closeSignerModal}
                onSubmit={handleSignerSubmit}
            />
        </div>
    );
}
