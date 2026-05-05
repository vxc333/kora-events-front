import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, MapPin, Laptop, Users, Tag, Ticket, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { usePublicEvent, useAvailableTickets, useRegisterForEvent } from "@/hooks/usePublicEvent";
import type { AvailableTicket } from "@/services/public";
import { PageBlockRenderer } from "@/components/BlockRenderers";
import { DEFAULT_PAGE_SETTINGS } from "@/types/page-builder";

function validateCpf(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder >= 10) remainder = 0;
    return remainder === parseInt(digits[10]);
}

function formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const schema = z.object({
    name: z.string().min(2, "Nome obrigatório"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(1, "CPF obrigatório").refine(validateCpf, "CPF inválido"),
    phone: z.string().min(1, "Telefone obrigatório"),
    couponCode: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(value: number, currency = "BRL") {
    if (value === 0) return "Gratuito";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value / 100);
}

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

interface TicketCardProps {
    ticket: AvailableTicket;
    selected: boolean;
    onSelect: () => void;
    primaryColor: string;
}

function TicketCard({ ticket, selected, onSelect, primaryColor }: TicketCardProps) {
    const rgb = hexToRgb(primaryColor);
    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={ticket.isSoldOut}
            className="w-full text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                borderRadius: 12,
                border: selected ? `2px solid ${primaryColor}` : "2px solid #E4E0F0",
                padding: "16px 20px",
                background: selected ? `rgba(${rgb}, 0.06)` : "#fff",
                boxShadow: selected ? `0 0 0 4px rgba(${rgb}, 0.12)` : "0 1px 3px rgba(0,0,0,0.06)",
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#19162A] text-base">{ticket.name}</span>
                        {ticket.isHalfPrice && (
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: `rgba(${rgb}, 0.12)`, color: primaryColor }}
                            >
                                Meia-entrada
                            </span>
                        )}
                        {ticket.isSoldOut && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Esgotado</span>
                        )}
                    </div>
                    {ticket.description && <p className="text-sm text-[#6A6680] mt-1">{ticket.description}</p>}
                    {ticket.quantity !== null && (
                        <p className="text-xs text-[#6A6680] mt-1.5">
                            {Math.max(0, (ticket.quantity ?? 0) - ticket.quantitySold)} vagas disponíveis
                        </p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    {ticket.isHalfPrice && ticket.price !== ticket.effectivePrice ? (
                        <>
                            <p className="text-xs line-through text-[#B0ACBF]">{formatCurrency(ticket.price)}</p>
                            <p className="text-lg font-bold" style={{ color: primaryColor }}>
                                {formatCurrency(ticket.effectivePrice)}
                            </p>
                        </>
                    ) : (
                        <p className="text-lg font-bold" style={{ color: ticket.effectivePrice === 0 ? "#16A34A" : primaryColor }}>
                            {formatCurrency(ticket.effectivePrice)}
                        </p>
                    )}
                </div>
            </div>
            {selected && !ticket.isSoldOut && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: `rgba(${rgb}, 0.2)` }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: primaryColor }} />
                    <span className="text-sm font-medium" style={{ color: primaryColor }}>
                        Selecionado
                    </span>
                </div>
            )}
        </button>
    );
}

export function PublicEventPage() {
    const { slug } = useParams<{ slug: string }>();
    const { event, isLoading: loadingEvent } = usePublicEvent(slug ?? "");
    const { tickets, isLoading: loadingTickets } = useAvailableTickets(event?.id ?? "");
    const { register: registerForEvent, isPending } = useRegisterForEvent(event?.id ?? "", slug ?? "");

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const primaryColor = event?.primaryColor ?? "#5B21B6";
    const rgb = hexToRgb(primaryColor);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: FormValues) => {
        registerForEvent({
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            phone: data.phone,
            couponCode: data.couponCode || undefined,
            ticketId: selectedTicketId || undefined,
        });
    };

    if (loadingEvent) {
        return (
            <div className="min-h-screen bg-[#FDFCFF] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-[#EDE9FE] border-t-[#5B21B6] animate-spin" />
                    <p className="text-sm text-[#6A6680]">Carregando evento...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#FDFCFF] flex items-center justify-center">
                <div className="text-center space-y-4 px-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE9FE] mx-auto">
                        <AlertCircle className="h-8 w-8 text-[#5B21B6]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#19162A]">Evento não encontrado</h1>
                    <p className="text-[#6A6680]">Este evento não existe ou não está mais disponível.</p>
                    <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-[#5B21B6] hover:underline">
                        Voltar ao início <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const hasTickets = tickets.length > 0 && !loadingTickets;
    const requiresTicket = hasTickets;

    const pageSettings = event.pageSettings ?? DEFAULT_PAGE_SETTINGS;
    const sortedBlocks = (event.pageBlocks ?? []).slice().sort((a, b) => a.order - b.order);

    const FONT_FAMILY: Record<typeof pageSettings.titleFont, string> = {
        'dm-serif': '"DM Serif Display", Georgia, serif',
        'inter': '"Inter", system-ui, sans-serif',
        'playfair': '"Playfair Display", Georgia, serif',
    };
    const titleFont = FONT_FAMILY[pageSettings.titleFont];

    const metaItems = (
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(event.startDate)}
                {event.endDate !== event.startDate && ` até ${formatDate(event.endDate)}`}
            </span>
            <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {event.startTime}
                {event.endTime ? ` – ${event.endTime}` : ""}
            </span>
            {event.isOnline ? (
                <span className="flex items-center gap-1.5">
                    <Laptop className="h-4 w-4" />
                    Evento online
                </span>
            ) : event.location ? (
                <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                </span>
            ) : null}
            {event.workloadHours != null && event.workloadHours > 0 && (
                <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {event.workloadHours}h de carga horária
                </span>
            )}
        </div>
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: pageSettings.bgColor }}>
            {/* Hero — banner layout */}
            {pageSettings.heroLayout === 'banner' && (
                <div
                    className="relative w-full"
                    style={{
                        background: event.bannerUrl ? undefined : `linear-gradient(135deg, rgba(${rgb}, 0.9) 0%, rgba(${rgb}, 0.6) 100%)`,
                        minHeight: 320,
                    }}
                >
                    {event.bannerUrl && (
                        <>
                            <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                            <div
                                className="absolute inset-0"
                                style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)` }}
                            />
                        </>
                    )}
                    <div className="relative mx-auto px-4 py-16 flex flex-col gap-4">
                        {event.logoUrl && <img src={event.logoUrl} alt="Logo" className="h-14 w-auto object-contain self-start rounded-lg" />}
                        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight" style={{ fontFamily: titleFont }}>
                            {event.title}
                        </h1>
                        <div className="text-white/85">{metaItems}</div>
                    </div>
                </div>
            )}

            {/* Hero — split layout */}
            {pageSettings.heroLayout === 'split' && (
                <div className="flex flex-col md:flex-row" style={{ minHeight: 340 }}>
                    <div className="relative md:w-1/2 min-h-[220px] md:min-h-0">
                        {event.bannerUrl ? (
                            <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div
                                className="absolute inset-0"
                                style={{ background: `linear-gradient(135deg, rgba(${rgb}, 0.9) 0%, rgba(${rgb}, 0.6) 100%)` }}
                            />
                        )}
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white">
                        {event.logoUrl && <img src={event.logoUrl} alt="Logo" className="h-12 w-auto object-contain self-start mb-4" />}
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#19162A] leading-tight" style={{ fontFamily: titleFont }}>
                            {event.title}
                        </h1>
                        <div className="mt-4 text-[#6A6680]">{metaItems}</div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
                {/* Sobre o evento */}
                <section>
                    <h2 className="text-xl font-semibold text-[#19162A] mb-3">Sobre o evento</h2>
                    <p className="text-[#6A6680] leading-relaxed whitespace-pre-line">{event.description}</p>
                </section>

                {/* Blocos personalizados */}
                {sortedBlocks.map((block) => (
                    <PageBlockRenderer
                        key={block.id}
                        block={block}
                        eventStartDate={event.startDate}
                        eventStartTime={event.startTime}
                    />
                ))}

                {/* Ingressos */}
                {hasTickets && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Ticket className="h-5 w-5" style={{ color: primaryColor }} />
                            <h2 className="text-xl font-semibold text-[#19162A]">Ingressos</h2>
                        </div>
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    selected={selectedTicketId === ticket.id}
                                    onSelect={() => setSelectedTicketId(ticket.id)}
                                    primaryColor={primaryColor}
                                />
                            ))}
                        </div>
                        {requiresTicket && !selectedTicketId && (
                            <p className="text-xs text-[#6A6680] mt-2 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Selecione um ingresso para continuar
                            </p>
                        )}
                    </section>
                )}

                {/* Formulário */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Tag className="h-5 w-5" style={{ color: primaryColor }} />
                        <h2 className="text-xl font-semibold text-[#19162A]">Sua inscrição</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Nome */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-[#19162A]">Nome completo *</label>
                                <input
                                    {...register("name")}
                                    placeholder="João da Silva"
                                    className="h-10 w-full rounded-xl border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#B0ACBF] transition-shadow focus:outline-none"
                                    style={{
                                        boxShadow: errors.name ? "0 0 0 2px #DC2626" : undefined,
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = errors.name ? "0 0 0 2px #DC2626" : "none";
                                    }}
                                />
                                {errors.name && (
                                    <p className="text-xs text-[#DC2626] flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-[#19162A]">Email *</label>
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="joao@email.com"
                                    className="h-10 w-full rounded-xl border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#B0ACBF] transition-shadow focus:outline-none"
                                    onFocus={(e) => {
                                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = errors.email ? "0 0 0 2px #DC2626" : "none";
                                    }}
                                />
                                {errors.email && (
                                    <p className="text-xs text-[#DC2626] flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* CPF */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-[#19162A]">CPF *</label>
                                <input
                                    {...register("cpf")}
                                    placeholder="000.000.000-00"
                                    inputMode="numeric"
                                    className="h-10 w-full rounded-xl border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#B0ACBF] focus:outline-none"
                                    style={{ boxShadow: errors.cpf ? "0 0 0 2px #DC2626" : undefined }}
                                    onChange={(e) => {
                                        const masked = formatCpf(e.target.value);
                                        e.target.value = masked;
                                        setValue("cpf", masked, { shouldValidate: false });
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = errors.cpf ? "0 0 0 2px #DC2626" : "none";
                                    }}
                                />
                                {errors.cpf && (
                                    <p className="text-xs text-[#DC2626] flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.cpf.message}
                                    </p>
                                )}
                            </div>

                            {/* Telefone */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-[#19162A]">Telefone *</label>
                                <input
                                    {...register("phone")}
                                    placeholder="(11) 91234-5678"
                                    inputMode="numeric"
                                    className="h-10 w-full rounded-xl border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#B0ACBF] focus:outline-none"
                                    style={{ boxShadow: errors.phone ? "0 0 0 2px #DC2626" : undefined }}
                                    onChange={(e) => {
                                        const masked = formatPhone(e.target.value);
                                        e.target.value = masked;
                                        setValue("phone", masked, { shouldValidate: false });
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = errors.phone ? "0 0 0 2px #DC2626" : "none";
                                    }}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-[#DC2626] flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            {/* Cupom */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-[#19162A]">
                                    Cupom de desconto <span className="text-[#B0ACBF] font-normal">(opcional)</span>
                                </label>
                                <input
                                    {...register("couponCode")}
                                    placeholder="CODIGO10"
                                    className="h-10 w-full rounded-xl border border-[#E4E0F0] bg-white px-3 text-sm text-[#19162A] placeholder:text-[#B0ACBF] uppercase focus:outline-none"
                                    onFocus={(e) => {
                                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || (requiresTicket && !selectedTicketId)}
                            className="w-full h-12 rounded-xl font-semibold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: primaryColor }}
                        >
                            {isPending ? (
                                <>
                                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Realizando inscrição...
                                </>
                            ) : (
                                <>
                                    Confirmar inscrição <ChevronRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </section>
            </div>

            {/* Footer */}
            <footer className="mt-16 py-8 border-t border-[#E4E0F0]">
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
