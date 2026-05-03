import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, Users, Award, BarChart2, Tag, Calendar, ArrowRight, Check, Sparkles, ChevronRight } from "lucide-react";
import koraLogo from "@/assets/kora-events-1.png";
import heroImage from "@/assets/hero.png";

/* ── Scroll reveal hook ─────────────────────────────────────── */
function useReveal(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, visible };
}

/* ── Feature data ────────────────────────────────────────────── */
const features = [
    {
        icon: Calendar,
        label: "01",
        title: "Gestão de eventos",
        desc: "Crie eventos online ou presenciais com banner, logo e página pública. Publique com um clique.",
    },
    {
        icon: Ticket,
        label: "02",
        title: "Ingressos em lotes",
        desc: "Defina quantidade, datas de venda e meia-entrada. O estoque é controlado automaticamente.",
    },
    {
        icon: Tag,
        label: "03",
        title: "Cupons de desconto",
        desc: "Percentual ou valor fixo, com limite de usos e data de expiração. Simples de criar, difícil de ignorar.",
    },
    {
        icon: Users,
        label: "04",
        title: "Participantes",
        desc: "Lista completa com filtros, busca e importação via CSV. Cancele e reative com um clique.",
    },
    {
        icon: Award,
        label: "05",
        title: "Certificados PDF",
        desc: "Geração automática após o evento. Templates personalizáveis com múltiplos assinantes.",
    },
    {
        icon: BarChart2,
        label: "06",
        title: "Relatórios",
        desc: "Relatório de presença em PDF exportável. Métricas de check-in para cada edição.",
    },
];

const freePlan = [
    "Eventos ilimitados",
    "Até 50 participantes por evento",
    "Ingressos gratuitos",
    "Certificados PDF automáticos",
    "Página pública do evento",
    "Relatório de presença",
];

const proPlan = [
    "Participantes ilimitados",
    "Ingressos pagos (cobrança por ingresso)",
    "Cupons de desconto",
    "Múltiplos assinantes no certificado",
    "Importação CSV em massa",
    "Suporte prioritário",
];

/* ── Component ───────────────────────────────────────────────── */
export function LandingPage() {
    const featuresReveal = useReveal();
    const pricingReveal = useReveal();
    const statsReveal = useReveal();
    const ctaReveal = useReveal();

    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 32);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const hasToken = !!localStorage.getItem("token");

    return (
        <div style={{ background: "#080713", minHeight: "100vh", overflowX: "hidden", color: "#EDE9FE" }}>
            {/* ── Background orbs (fixed, never move) ── */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div
                    style={{
                        position: "absolute",
                        top: "-20%",
                        left: "-10%",
                        width: "70vw",
                        height: "70vw",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 70%)",
                        animation: "orbDrift 18s ease-in-out infinite",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-30%",
                        right: "-15%",
                        width: "60vw",
                        height: "60vw",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(76,29,149,0.18) 0%, transparent 70%)",
                        animation: "orbDrift 24s ease-in-out infinite reverse",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "45%",
                        right: "20%",
                        width: "30vw",
                        height: "30vw",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
                        animation: "orbDrift 14s ease-in-out infinite 4s",
                    }}
                />
            </div>

            {/* ── Nav ── */}
            <header
                className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all"
                style={{
                    height: 64,
                    background: scrolled ? "rgba(8,7,19,0.85)" : "transparent",
                    backdropFilter: scrolled ? "blur(20px)" : "none",
                    borderBottom: scrolled ? "1px solid rgba(139,92,246,0.12)" : "1px solid transparent",
                    transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
                }}
            >
                <img src={koraLogo} alt="Kora Events" style={{ height: 96, objectFit: "contain" }} />
                <nav className="flex items-center gap-2">
                    {hasToken ? (
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{ background: "rgba(139,92,246,0.15)", color: "#C4B5FD", border: "1px solid rgba(139,92,246,0.25)" }}
                        >
                            Dashboard <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{ color: "rgba(237,233,254,0.6)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9FE")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,254,0.6)")}
                            >
                                Entrar
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                                    color: "#fff",
                                    boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                                }}
                            >
                                Criar conta <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* ── Hero ── */}
            <section
                className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 px-6 md:px-12 lg:px-20"
                style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80, zIndex: 1 }}
            >
                {/* Text */}
                <div className="flex-1 max-w-2xl">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                        style={{
                            background: "rgba(139,92,246,0.12)",
                            border: "1px solid rgba(139,92,246,0.25)",
                            color: "#C4B5FD",
                            animation: "landingFadeUp 0.5s ease-out both",
                        }}
                    >
                        <Sparkles className="h-3 w-3" />
                        Plataforma de eventos profissional
                    </div>

                    <h1
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(3rem, 7vw, 6rem)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.02em",
                            color: "#F0EBF8",
                            animation: "landingFadeUp 0.6s ease-out 0.1s both",
                        }}
                    >
                        Organize eventos
                        <br />
                        <em style={{ color: "#A78BFA", fontStyle: "italic" }}>extraordinários.</em>
                    </h1>

                    <p
                        className="mt-6 text-base leading-relaxed max-w-lg"
                        style={{
                            color: "rgba(237,233,254,0.55)",
                            animation: "landingFadeUp 0.6s ease-out 0.2s both",
                        }}
                    >
                        Da criação ao certificado — ingressos, participantes, cupons e relatórios em um único lugar. Gratuito para começar,
                        profissional para escalar.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-10" style={{ animation: "landingFadeUp 0.6s ease-out 0.3s both" }}>
                        <Link
                            to="/register"
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                            style={{
                                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                                color: "#fff",
                                boxShadow: "0 4px 32px rgba(124,58,237,0.4)",
                            }}
                        >
                            Começar grátis <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                color: "rgba(237,233,254,0.7)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            Já tenho conta
                        </Link>
                    </div>

                    {/* Trust signal */}
                    <p
                        className="mt-8 text-xs"
                        style={{
                            color: "rgba(237,233,254,0.3)",
                            animation: "landingFadeUp 0.6s ease-out 0.4s both",
                        }}
                    >
                        Sem cartão de crédito · Gratuito para sempre (plano básico)
                    </p>
                </div>

                {/* Hero image */}
                <div
                    className="relative flex-shrink-0 flex items-center justify-center"
                    style={{
                        width: "clamp(280px, 38vw, 480px)",
                        animation: "landingFadeUp 0.8s ease-out 0.2s both",
                    }}
                >
                    {/* Glow disc */}
                    <div
                        style={{
                            position: "absolute",
                            width: "80%",
                            height: "80%",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(109,40,217,0.5) 0%, rgba(76,29,149,0.2) 50%, transparent 75%)",
                            filter: "blur(40px)",
                        }}
                    />
                    <img
                        src={heroImage}
                        alt="Kora Events"
                        style={{
                            width: "100%",
                            objectFit: "contain",
                            position: "relative",
                            filter: "drop-shadow(0 0 60px rgba(139,92,246,0.55))",
                            animation: "heroFloat 7s ease-in-out infinite",
                        }}
                    />
                </div>
            </section>

            {/* ── Stats ── */}
            <div ref={statsReveal.ref} style={{ zIndex: 1, position: "relative" }}>
                <section
                    className="px-6 md:px-12 lg:px-20 py-20"
                    style={{
                        borderTop: "1px solid rgba(139,92,246,0.1)",
                        borderBottom: "1px solid rgba(139,92,246,0.1)",
                        animation: statsReveal.visible ? "landingFadeUp 0.7s ease-out both" : "none",
                    }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-4xl mx-auto text-center">
                        {[
                            { value: "1.200+", label: "Eventos criados", suffix: "" },
                            { value: "50", label: "Participantes por evento grátis", suffix: "k+" },
                            { value: "98%", label: "Satisfação dos organizadores", suffix: "" },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <p
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "clamp(2.5rem, 5vw, 4rem)",
                                        color: "#C4B5FD",
                                        lineHeight: 1,
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {value}
                                </p>
                                <p className="mt-2 text-sm" style={{ color: "rgba(237,233,254,0.45)" }}>
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Features ── */}
            <div ref={featuresReveal.ref} style={{ zIndex: 1, position: "relative" }}>
                <section className="px-6 md:px-12 lg:px-20 py-28">
                    <div
                        className="text-center mb-20"
                        style={{ animation: featuresReveal.visible ? "landingFadeUp 0.6s ease-out both" : "none" }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: "#8B5CF6" }}>
                            Funcionalidades
                        </p>
                        <h2
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                                lineHeight: 1.1,
                                letterSpacing: "-0.02em",
                                color: "#F0EBF8",
                            }}
                        >
                            Tudo que você precisa,
                            <br />
                            <em style={{ color: "#A78BFA" }}>nada que você não precisa.</em>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                        {features.map(({ icon: Icon, label, title, desc }, i) => (
                            <div
                                key={title}
                                style={{
                                    background: "rgba(20,16,40,0.6)",
                                    border: "1px solid rgba(139,92,246,0.12)",
                                    borderRadius: 16,
                                    padding: "28px 28px 32px",
                                    backdropFilter: "blur(12px)",
                                    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                                    cursor: "default",
                                    animation: featuresReveal.visible ? `landingFadeUp 0.6s ease-out ${0.05 * i}s both` : "none",
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.borderColor = "rgba(139,92,246,0.35)";
                                    el.style.boxShadow = "0 8px 40px rgba(109,40,217,0.2)";
                                    el.style.transform = "translateY(-4px)";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.borderColor = "rgba(139,92,246,0.12)";
                                    el.style.boxShadow = "none";
                                    el.style.transform = "translateY(0)";
                                }}
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: 44,
                                            height: 44,
                                            borderRadius: 12,
                                            background: "rgba(109,40,217,0.2)",
                                            border: "1px solid rgba(139,92,246,0.2)",
                                        }}
                                    >
                                        <Icon className="h-5 w-5" style={{ color: "#A78BFA" }} />
                                    </div>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "2rem",
                                            color: "rgba(139,92,246,0.2)",
                                            lineHeight: 1,
                                            letterSpacing: "-0.03em",
                                        }}
                                    >
                                        {label}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold mb-2" style={{ color: "#EDE9FE" }}>
                                    {title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "rgba(237,233,254,0.5)" }}>
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Pricing ── */}
            <div ref={pricingReveal.ref} style={{ zIndex: 1, position: "relative" }}>
                <section className="px-6 md:px-12 lg:px-20 py-28" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
                    <div
                        className="text-center mb-16"
                        style={{ animation: pricingReveal.visible ? "landingFadeUp 0.6s ease-out both" : "none" }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: "#8B5CF6" }}>
                            Preços
                        </p>
                        <h2
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                                lineHeight: 1.1,
                                letterSpacing: "-0.02em",
                                color: "#F0EBF8",
                            }}
                        >
                            Simples de entender,
                            <br />
                            <em style={{ color: "#A78BFA" }}>justo para todos.</em>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Gratuito */}
                        <div
                            style={{
                                background: "rgba(20,16,40,0.6)",
                                border: "1px solid rgba(139,92,246,0.15)",
                                borderRadius: 20,
                                padding: "36px 32px",
                                backdropFilter: "blur(12px)",
                                animation: pricingReveal.visible ? "landingFadeUp 0.6s ease-out 0.1s both" : "none",
                            }}
                        >
                            <div className="flex items-baseline gap-1 mb-1">
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "3rem", color: "#EDE9FE", lineHeight: 1 }}>
                                    R$0
                                </span>
                            </div>
                            <p className="text-sm mb-2" style={{ color: "rgba(237,233,254,0.45)" }}>
                                para sempre
                            </p>
                            <h3 className="text-lg font-semibold mb-1" style={{ color: "#EDE9FE" }}>
                                Gratuito
                            </h3>
                            <p className="text-sm mb-8" style={{ color: "rgba(237,233,254,0.45)" }}>
                                Tudo que você precisa para começar sem gastar nada.
                            </p>

                            <ul className="space-y-3 mb-8">
                                {freePlan.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(237,233,254,0.7)" }}>
                                        <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#8B5CF6" }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: "rgba(139,92,246,0.12)",
                                    color: "#C4B5FD",
                                    border: "1px solid rgba(139,92,246,0.2)",
                                }}
                            >
                                Começar agora <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Pro */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(76,29,149,0.2) 100%)",
                                border: "1px solid rgba(139,92,246,0.4)",
                                borderRadius: 20,
                                padding: "36px 32px",
                                backdropFilter: "blur(12px)",
                                boxShadow: "0 0 60px rgba(109,40,217,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                                position: "relative",
                                overflow: "hidden",
                                animation: pricingReveal.visible ? "landingFadeUp 0.6s ease-out 0.2s both" : "none",
                            }}
                        >
                            {/* Glow accent */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: -60,
                                    right: -60,
                                    width: 200,
                                    height: 200,
                                    borderRadius: "50%",
                                    background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            />

                            <div
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                                style={{ background: "rgba(139,92,246,0.25)", color: "#C4B5FD", border: "1px solid rgba(139,92,246,0.3)" }}
                            >
                                <Sparkles className="h-3 w-3" /> Pro
                            </div>

                            <div className="flex items-baseline gap-2 mb-1">
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "3rem", color: "#EDE9FE", lineHeight: 1 }}>
                                    5%
                                </span>
                                <span className="text-sm" style={{ color: "rgba(237,233,254,0.5)" }}>
                                    + R$0,99
                                </span>
                            </div>
                            <p className="text-sm mb-2" style={{ color: "rgba(237,233,254,0.45)" }}>
                                por ingresso vendido
                            </p>
                            <h3 className="text-lg font-semibold mb-1" style={{ color: "#EDE9FE" }}>
                                Profissional
                            </h3>
                            <p className="text-sm mb-8" style={{ color: "rgba(237,233,254,0.45)" }}>
                                Para eventos com mais de 50 participantes ou ingressos pagos.
                            </p>

                            <ul className="space-y-3 mb-8">
                                {proPlan.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(237,233,254,0.7)" }}>
                                        <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#A78BFA" }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                                    color: "#fff",
                                    boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
                                }}
                            >
                                Começar com Pro <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── CTA final ── */}
            <div ref={ctaReveal.ref} style={{ zIndex: 1, position: "relative" }}>
                <section
                    className="px-6 md:px-12 lg:px-20 py-32 text-center"
                    style={{
                        borderTop: "1px solid rgba(139,92,246,0.1)",
                        animation: ctaReveal.visible ? "landingFadeUp 0.7s ease-out both" : "none",
                    }}
                >
                    <div
                        className="inline-block px-4 py-2 rounded-full text-xs font-medium mb-8"
                        style={{
                            background: "rgba(139,92,246,0.1)",
                            border: "1px solid rgba(139,92,246,0.2)",
                            color: "#A78BFA",
                        }}
                    >
                        Comece hoje
                    </div>
                    <h2
                        className="mx-auto max-w-3xl"
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(2.5rem, 6vw, 5rem)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.025em",
                            color: "#F0EBF8",
                        }}
                    >
                        Seus próximos eventos merecem uma plataforma <em style={{ color: "#A78BFA" }}>à altura.</em>
                    </h2>
                    <p className="mt-6 text-base max-w-md mx-auto" style={{ color: "rgba(237,233,254,0.45)" }}>
                        Crie sua conta em menos de 1 minuto e publique seu primeiro evento hoje.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all"
                            style={{
                                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                                color: "#fff",
                                fontSize: "1rem",
                                boxShadow: "0 8px 48px rgba(124,58,237,0.45)",
                            }}
                        >
                            Criar conta grátis <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </section>
            </div>

            {/* ── Footer ── */}
            <footer
                className="px-6 md:px-12 lg:px-20 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                    borderTop: "1px solid rgba(139,92,246,0.1)",
                    zIndex: 1,
                    position: "relative",
                }}
            >
                <img src={koraLogo} alt="Kora Events" style={{ height: 28, objectFit: "contain", opacity: 0.6 }} />
                <p className="text-xs" style={{ color: "rgba(237,233,254,0.25)" }}>
                    © {new Date().getFullYear()} Kora Events. Todos os direitos reservados.
                </p>
                <div className="flex items-center gap-5">
                    <Link
                        to="/login"
                        className="text-xs transition-colors"
                        style={{ color: "rgba(237,233,254,0.3)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(237,233,254,0.7)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,254,0.3)")}
                    >
                        Entrar
                    </Link>
                    <Link
                        to="/register"
                        className="text-xs transition-colors"
                        style={{ color: "rgba(237,233,254,0.3)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(237,233,254,0.7)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,254,0.3)")}
                    >
                        Criar conta
                    </Link>
                </div>
            </footer>
        </div>
    );
}
