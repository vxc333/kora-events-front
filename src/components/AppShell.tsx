import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { CalendarDays, LogOut, Plus, ScanLine, ChevronDown, BarChart3, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import koraLogoDark from "@/assets/kora-events-1.png";

// ── Types ─────────────────────────────────────────────────────────────

type NavChild = { label: string; href: string };
type NavItemDef = {
    label: string;
    Icon: React.ElementType;
    href?: string;
    children?: NavChild[];
    soon?: boolean;
};
type NavSection = { label: string; items: NavItemDef[] };

// ── Navigation structure ───────────────────────────────────────────────

const NAVIGATION: NavSection[] = [
    {
        label: "Gestão",
        items: [
            {
                label: "Eventos",
                Icon: CalendarDays,
                children: [
                    { label: "Meus Eventos", href: "/dashboard" },
                    { label: "Criar Evento", href: "/events/new" },
                ],
            },
            { label: "Check-in", Icon: ScanLine, href: "/checkin" },
        ],
    },
    {
        label: "Análises",
        items: [{ label: "Relatórios", Icon: BarChart3, soon: true }],
    },
    {
        label: "Geral",
        items: [{ label: "Configurações", Icon: Settings, soon: true }],
    },
];

// ── Sub-item link ──────────────────────────────────────────────────────

function SubNavLink({ child }: { child: NavChild }) {
    return (
        <NavLink
            to={child.href}
            end
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-2.5 rounded-md py-[7px] pl-3 pr-2 text-[12.5px] transition-colors duration-150",
                    isActive ? "text-violet-300 font-medium" : "text-white/35 hover:text-white/65",
                )
            }
        >
            {({ isActive }) => (
                <>
                    <span
                        className={cn(
                            "h-[5px] w-[5px] rounded-full flex-shrink-0 transition-all duration-200",
                            isActive ? "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.6)]" : "bg-white/15",
                        )}
                    />
                    {child.label}
                </>
            )}
        </NavLink>
    );
}

// ── Nav item ───────────────────────────────────────────────────────────

function NavItem({ item, collapsed }: { item: NavItemDef; collapsed: boolean }) {
    const location = useLocation();

    const isChildActive = !!item.children?.some((c) => location.pathname === c.href || location.pathname.startsWith(c.href + "/"));
    const [open, setOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) setOpen(true);
    }, [isChildActive]);

    // Disabled "soon" items
    if (item.soon) {
        return (
            <div
                title={collapsed ? item.label : undefined}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-[10px] text-[13px] font-medium cursor-not-allowed select-none text-white/20",
                    collapsed && "justify-center",
                )}
            >
                <item.Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                    <>
                        <span className="flex-1">{item.label}</span>
                        <span
                            className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-[3px] rounded"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.22)" }}
                        >
                            em breve
                        </span>
                    </>
                )}
            </div>
        );
    }

    // Collapsible group with children
    if (item.children?.length) {
        return (
            <div>
                <button
                    onClick={() => setOpen((o) => !o)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-3 py-[10px] text-[13px] font-medium transition-colors duration-150 cursor-pointer",
                        isChildActive ? "bg-violet-500/[0.12] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/65",
                        collapsed && "justify-center",
                    )}
                >
                    <item.Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                                className={cn(
                                    "h-3.5 w-3.5 text-white/25 transition-transform duration-200 flex-shrink-0",
                                    open && "rotate-180",
                                )}
                            />
                        </>
                    )}
                </button>

                {!collapsed && (
                    <div
                        className="overflow-hidden transition-all duration-200 ease-in-out"
                        style={{ maxHeight: open ? "160px" : "0px", opacity: open ? 1 : 0 }}
                    >
                        <div className="mt-0.5 ml-3.5 border-l border-white/[0.06] pl-1.5 pb-1 space-y-0.5">
                            {item.children.map((child) => (
                                <SubNavLink key={child.href} child={child} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Regular single link
    return (
        <NavLink
            to={item.href!}
            end
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 rounded-lg px-3 py-[10px] text-[13px] font-medium transition-colors duration-150",
                    isActive ? "bg-violet-500/[0.12] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/65",
                    collapsed && "justify-center",
                )
            }
        >
            <item.Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
        </NavLink>
    );
}

// ── AppShell ───────────────────────────────────────────────────────────

export function AppShell() {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";

    return (
        <div className="flex h-screen" style={{ background: "var(--color-bg-subtle)" }}>
            {/* Sidebar */}
            <aside
                className="relative flex flex-col flex-shrink-0"
                style={{
                    width: collapsed ? "68px" : "272px",
                    transition: "width 0.25s ease",
                    background: "#0B0912",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {/* Ambient top glow */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-52"
                    style={{
                        background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(124,58,237,0.22) 0%, transparent 100%)",
                    }}
                />

                {/* Brand */}
                <Link
                    to="/dashboard"
                    className="relative flex flex-shrink-0 items-center transition-opacity hover:opacity-80"
                    style={{
                        justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? "18px 0" : "18px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    {collapsed ? (
                        <div
                            className="h-7 w-7 rounded-md flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" }}
                        >
                            <span className="text-white text-[11px] font-bold tracking-tight">K</span>
                        </div>
                    ) : (
                        <img
                            src={koraLogoDark}
                            alt="Kora Events"
                            className="h-7 w-auto object-contain object-left"
                            style={{ maxWidth: 130 }}
                        />
                    )}
                </Link>

                {/* Navigation */}
                <nav className="relative flex-1 overflow-y-auto overflow-x-hidden p-2.5">
                    <div className="space-y-5">
                        {NAVIGATION.map((section) => (
                            <div key={section.label}>
                                {!collapsed ? (
                                    <p
                                        className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase select-none"
                                        style={{ color: "rgba(255,255,255,0.17)" }}
                                    >
                                        {section.label}
                                    </p>
                                ) : (
                                    <div className="mx-auto mb-1 w-5 border-t border-white/[0.07]" />
                                )}
                                <div className="space-y-0.5">
                                    {section.items.map((item) => (
                                        <NavItem key={item.label} item={item} collapsed={collapsed} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <div className="relative space-y-1.5 p-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {/* Create event CTA */}
                    {!collapsed ? (
                        <Link to="/events/new" className="mb-2 block">
                            <button
                                className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-[10px] text-[13px] font-medium text-white cursor-pointer"
                                style={{
                                    background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                                    boxShadow: "0 2px 10px rgba(109,40,217,0.4)",
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                Criar Evento
                            </button>
                        </Link>
                    ) : (
                        <Link to="/events/new" title="Criar Evento" className="mb-1 flex justify-center">
                            <div
                                className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                                style={{
                                    background: "rgba(124,58,237,0.18)",
                                    border: "1px solid rgba(124,58,237,0.3)",
                                }}
                            >
                                <Plus className="h-4 w-4 text-violet-400" />
                            </div>
                        </Link>
                    )}

                    {/* User profile */}
                    <div
                        className="flex items-center gap-2.5 rounded-lg py-2 transition-colors hover:bg-white/[0.04]"
                        style={{
                            padding: collapsed ? "8px 8px" : "8px 10px",
                            justifyContent: collapsed ? "center" : "flex-start",
                        }}
                        title={collapsed ? (user?.name ?? undefined) : undefined}
                    >
                        <div
                            className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "rgba(139,92,246,0.16)",
                                border: "1px solid rgba(139,92,246,0.32)",
                            }}
                        >
                            <span className="text-[11px] font-semibold text-violet-300">{initial}</span>
                        </div>
                        {!collapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12.5px] font-medium leading-none truncate text-white/65">{user?.name}</p>
                                    <p className="mt-0.5 text-[10px] truncate text-white/25">{user?.email}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    title="Sair"
                                    className="flex-shrink-0 p-1 rounded text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className={cn(
                            "flex items-center rounded-lg py-1.5 text-[11px] text-white/18 hover:text-white/40 hover:bg-white/[0.04] transition-all duration-150 cursor-pointer w-full",
                            collapsed ? "justify-center" : "gap-2 px-3",
                        )}
                    >
                        {collapsed ? (
                            <PanelLeftOpen className="h-3.5 w-3.5" />
                        ) : (
                            <>
                                <PanelLeftClose className="h-3.5 w-3.5" />
                                <span>Recolher menu</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto" style={{ background: "var(--color-bg-subtle)" }}>
                <Outlet />
            </main>
        </div>
    );
}
