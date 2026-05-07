import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Wifi, Calendar, ChevronRight, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMarketplaceEvents } from "@/services/marketplace";
import type { MarketplaceEvent } from "@/services/marketplace";

// ── Constants ─────────────────────────────────────────────────────────

const CATEGORIES = [
    { label: "Todos", value: "" },
    { label: "Tecnologia", value: "Tecnologia" },
    { label: "Educação", value: "Educação" },
    { label: "Cultura", value: "Cultura" },
    { label: "Negócios", value: "Negócios" },
    { label: "Saúde", value: "Saúde" },
];

const MOCK_FEATURED: MarketplaceEvent[] = [
    {
        id: "mock-1",
        slug: "summit-tech-2026",
        title: "Summit Tech 2026",
        description: "O maior evento de tecnologia do Brasil",
        bannerUrl: null,
        startDate: "2026-06-15",
        endDate: "2026-06-17",
        location: "São Paulo, SP",
        isOnline: false,
        primaryColor: "#5B21B6",
        ticketsAvailable: 120,
        minPrice: 29900,
        category: "Tecnologia",
        featured: true,
    },
    {
        id: "mock-2",
        slug: "workshop-design-systems",
        title: "Workshop: Design Systems na Prática",
        description: "Aprenda a criar sistemas de design escaláveis",
        bannerUrl: null,
        startDate: "2026-06-20",
        endDate: "2026-06-20",
        location: null,
        isOnline: true,
        primaryColor: "#0891B2",
        ticketsAvailable: 50,
        minPrice: 0,
        category: "Educação",
        featured: true,
    },
    {
        id: "mock-3",
        slug: "forum-negocios-2026",
        title: "Fórum de Negócios e Inovação",
        description: "Conecte-se com os líderes da inovação",
        bannerUrl: null,
        startDate: "2026-07-10",
        endDate: "2026-07-11",
        location: "Rio de Janeiro, RJ",
        isOnline: false,
        primaryColor: "#B45309",
        ticketsAvailable: 200,
        minPrice: 49900,
        category: "Negócios",
        featured: true,
    },
    {
        id: "mock-4",
        slug: "festival-cultura-digital",
        title: "Festival de Cultura Digital",
        description: "Arte, música e tecnologia em um só lugar",
        bannerUrl: null,
        startDate: "2026-07-25",
        endDate: "2026-07-27",
        location: "Belo Horizonte, MG",
        isOnline: false,
        primaryColor: "#BE185D",
        ticketsAvailable: 500,
        minPrice: 0,
        category: "Cultura",
        featured: true,
    },
];

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatPrice(cents: number): string {
    if (cents === 0) return "Gratuito";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

// ── EventCard ─────────────────────────────────────────────────────────

function EventCard({ event }: { event: MarketplaceEvent }) {
    const rgb = hexToRgb(event.primaryColor);
    return (
        <Link
            to={`/e/${event.slug}`}
            className="group flex flex-col rounded-2xl overflow-hidden border border-[#E8E4F0] bg-white transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1"
        >
            {/* Banner / colored placeholder */}
            <div
                className="relative w-full"
                style={{
                    paddingBottom: "52%",
                    background: event.bannerUrl
                        ? undefined
                        : `linear-gradient(135deg, rgba(${rgb},0.9) 0%, rgba(${rgb},0.6) 100%)`,
                }}
            >
                {event.bannerUrl ? (
                    <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="text-4xl font-bold opacity-20 select-none"
                            style={{
                                fontFamily: "var(--font-display)",
                                color: "#fff",
                                fontSize: "clamp(1.5rem, 5vw, 3rem)",
                                letterSpacing: "-0.03em",
                            }}
                        >
                            {event.title.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                )}

                {/* Category tag */}
                {event.category && (
                    <span
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
                    >
                        {event.category}
                    </span>
                )}

                {/* Price badge */}
                <span
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={
                        event.minPrice === 0
                            ? { background: "#DCFCE7", color: "#16A34A" }
                            : { background: `rgba(${rgb},0.12)`, color: event.primaryColor, border: `1px solid rgba(${rgb},0.25)` }
                    }
                >
                    {formatPrice(event.minPrice)}
                </span>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-4 gap-2">
                <h3
                    className="font-semibold text-[#19162A] leading-tight line-clamp-2 group-hover:text-[#5B21B6] transition-colors"
                    style={{ fontSize: "0.9375rem" }}
                >
                    {event.title}
                </h3>

                <div className="flex flex-col gap-1 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-[#6A6680]">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" style={{ color: event.primaryColor }} />
                        {formatDate(event.startDate)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#6A6680]">
                        {event.isOnline ? (
                            <>
                                <Wifi className="h-3.5 w-3.5 flex-shrink-0" style={{ color: event.primaryColor }} />
                                Online
                            </>
                        ) : event.location ? (
                            <>
                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: event.primaryColor }} />
                                <span className="truncate">{event.location}</span>
                            </>
                        ) : null}
                    </span>
                </div>

                {event.ticketsAvailable > 0 && (
                    <p className="text-[11px] text-[#9CA3AF] mt-auto pt-2">
                        {event.ticketsAvailable} vagas disponíveis
                    </p>
                )}
            </div>
        </Link>
    );
}

// ── Skeleton card ─────────────────────────────────────────────────────

function EventCardSkeleton() {
    return (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-[#E8E4F0] bg-white">
            <Skeleton className="w-full" style={{ paddingBottom: "52%", height: 0 }} />
            <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-3 w-2/5 rounded" />
            </div>
        </div>
    );
}

// ── FeaturedCard ──────────────────────────────────────────────────────

function FeaturedCard({ event }: { event: MarketplaceEvent }) {
    const rgb = hexToRgb(event.primaryColor);
    return (
        <Link
            to={`/e/${event.slug}`}
            className="group flex-shrink-0 rounded-2xl overflow-hidden border border-[#E8E4F0] bg-white transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1"
            style={{ width: 260 }}
        >
            <div
                className="relative w-full"
                style={{
                    height: 140,
                    background: event.bannerUrl
                        ? undefined
                        : `linear-gradient(135deg, rgba(${rgb},0.9) 0%, rgba(${rgb},0.55) 100%)`,
                }}
            >
                {event.bannerUrl && (
                    <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-end p-3">
                    <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
                    >
                        {formatPrice(event.minPrice)}
                    </span>
                </div>
            </div>
            <div className="p-3">
                <p className="font-semibold text-sm text-[#19162A] line-clamp-1 group-hover:text-[#5B21B6] transition-colors">
                    {event.title}
                </p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">{formatDate(event.startDate)}</p>
            </div>
        </Link>
    );
}

// ── Empty state ───────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div
                className="relative flex items-center justify-center"
                style={{ width: 100, height: 100 }}
            >
                <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(91,33,182,0.08) 0%, transparent 70%)" }}
                />
                <div
                    className="flex items-center justify-center w-16 h-16 rounded-2xl"
                    style={{ background: "#EDE9FE", border: "2px dashed #C4B5FD" }}
                >
                    <Tag className="h-7 w-7" style={{ color: "#7C3AED" }} />
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#19162A]" style={{ fontFamily: "var(--font-display)" }}>
                    {hasFilters ? "Nenhum evento encontrado" : "Em breve por aqui"}
                </h3>
                <p className="text-sm text-[#6A6680] max-w-xs">
                    {hasFilters
                        ? "Tente ajustar os filtros ou buscar por outro termo."
                        : "Novos eventos serão publicados em breve. Volte mais tarde!"}
                </p>
            </div>
            {hasFilters && (
                <Link to="/eventos">
                    <Button variant="outline" size="sm" className="border-[#E4E0F0] text-[#5B21B6]">
                        Limpar filtros
                    </Button>
                </Link>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────

export function MarketplacePage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 12;

    const { data, isLoading } = useQuery({
        queryKey: ["marketplace-events", search, category, page],
        queryFn: () =>
            getMarketplaceEvents({
                search: search || undefined,
                category: category || undefined,
                page,
                limit: LIMIT,
            }),
        retry: false,
        // treat 404 / empty as empty data gracefully
    });

    const events = data?.data ?? [];
    const total = data?.total ?? 0;
    const hasMore = events.length > 0 && page * LIMIT < total;
    const hasFilters = !!search || !!category;

    return (
        <div className="min-h-screen" style={{ background: "#FDFCFF" }}>
            {/* ── Nav ──────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-12"
                style={{
                    height: 60,
                    background: "rgba(253,252,255,0.9)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid #E8E4F0",
                }}
            >
                <Link to="/" className="text-sm font-semibold text-[#5B21B6]">
                    ← Kora Events
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        to="/portal"
                        className="text-xs font-medium text-[#6A6680] hover:text-[#5B21B6] transition-colors"
                    >
                        Meu portal
                    </Link>
                    <Link
                        to="/login"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "#EDE9FE", color: "#5B21B6" }}
                    >
                        Entrar
                    </Link>
                </div>
            </header>

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="px-6 md:px-12 pt-14 pb-10 max-w-5xl mx-auto">
                <div className="mb-2">
                    <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-4"
                        style={{ color: "#7C3AED" }}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: "#7C3AED", boxShadow: "0 0 8px rgba(124,58,237,0.5)" }}
                        />
                        Marketplace
                    </span>
                </div>
                <h1
                    className="leading-tight mb-3"
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        letterSpacing: "-0.025em",
                        color: "#19162A",
                    }}
                >
                    Descubra eventos
                    <br />
                    <em style={{ color: "#7C3AED", fontStyle: "italic" }}>incríveis.</em>
                </h1>
                <p className="text-base text-[#6A6680] mb-8 max-w-xl">
                    Tecnologia, cultura, educação e muito mais — encontre o evento perfeito perto de você.
                </p>

                {/* Search bar */}
                <div className="relative max-w-xl">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
                        style={{ color: "#9CA3AF" }}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Buscar por nome, cidade ou categoria…"
                        className="w-full h-12 pl-11 pr-4 rounded-2xl border text-sm text-[#19162A] placeholder:text-[#9CA3AF] focus:outline-none transition-shadow"
                        style={{
                            background: "#fff",
                            border: "1.5px solid #E8E4F0",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
                        onBlur={(e) => (e.target.style.borderColor = "#E8E4F0")}
                    />
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2 mt-5">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => {
                                setCategory(cat.value);
                                setPage(1);
                            }}
                            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                            style={
                                category === cat.value
                                    ? {
                                          background: "#5B21B6",
                                          color: "#fff",
                                          boxShadow: "0 2px 12px rgba(91,33,182,0.3)",
                                      }
                                    : {
                                          background: "#fff",
                                          color: "#6A6680",
                                          border: "1.5px solid #E8E4F0",
                                      }
                            }
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Featured strip ────────────────────────────────────── */}
            {!hasFilters && (
                <section className="px-6 md:px-12 pb-10 max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-[#19162A]">Em destaque</h2>
                        <span className="flex items-center gap-1 text-xs text-[#7C3AED] font-medium cursor-pointer">
                            Ver todos <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: "none" }}>
                        {MOCK_FEATURED.map((event) => (
                            <FeaturedCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Events grid ───────────────────────────────────────── */}
            <section className="px-6 md:px-12 pb-20 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-[#19162A]">
                        {hasFilters ? "Resultados" : "Todos os eventos"}
                    </h2>
                    {total > 0 && (
                        <Badge variant="secondary" className="text-xs text-[#6A6680]">
                            {total} evento{total !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)
                    ) : events.length === 0 ? (
                        <EmptyState hasFilters={hasFilters} />
                    ) : (
                        events.map((event) => <EventCard key={event.id} event={event} />)
                    )}
                </div>

                {/* Load more */}
                {hasMore && (
                    <div className="flex justify-center mt-10">
                        <Button
                            variant="outline"
                            className="px-8 border-[#E4E0F0] text-[#5B21B6] hover:bg-[#EDE9FE]"
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Carregar mais
                        </Button>
                    </div>
                )}
            </section>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer
                className="px-6 md:px-12 py-8 flex items-center justify-center"
                style={{ borderTop: "1px solid #E8E4F0" }}
            >
                <p className="text-xs text-[#9CA3AF]">
                    © {new Date().getFullYear()} Kora Events. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    );
}
