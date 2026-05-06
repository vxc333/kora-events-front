# Arquitetura

Visão geral da stack, estrutura de módulos, roteamento e fluxo de dados.

---

## Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| Framework UI | React 19 |
| Linguagem | TypeScript |
| Build tool | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Roteamento | React Router DOM 7 |
| Requisições HTTP | Axios |
| Estado do servidor | TanStack React Query 5 |
| Formulários | React Hook Form + Zod |
| Componentes | Radix UI (primitivos) + shadcn/ui |
| Ícones | Lucide React |
| Notificações (toast) | Sonner |
| Drag and drop | @dnd-kit |
| Scanner QR | jsqr |
| PWA | vite-plugin-pwa + Workbox |
| Testes | Vitest + Testing Library |

---

## Bootstrap (`main.tsx`)

```
main.tsx
├── Registra Service Worker (PWA)
├── Cria QueryClient (staleTime: 60s)
├── Envolve o app com:
│   ├── QueryClientProvider
│   ├── BrowserRouter
│   └── Toaster (sonner)
└── Monta <App />
```

---

## Roteamento (`App.tsx`)

```
/                        → LandingPage (pública)
/login                   → LoginPage (pública)
/register                → RegisterPage (pública)
/forgot-password         → ForgotPasswordPage (pública)
/reset-password          → ResetPasswordPage (pública)
/e/:slug                 → PublicEventPage (pública)
/e/:slug/confirmacao     → ConfirmationPage (pública)

/checkin                 → CheckinPage (privada, sem AppShell)
/checkin/:eventId        → CheckinScannerPage (privada, sem AppShell)

/dashboard               → DashboardPage           ┐
/events/new              → EventFormPage            │ Privadas
/events/:id              → EventDetailPage          │ dentro do
/events/:id/edit         → EventFormPage            │ AppShell
/financeiro              → FinanceiroDashboardPage  ┘

/events/:id/certificate-editor → CertificateEditorPage (privada, tela cheia)

*                        → NotFoundPage
```

### Rotas privadas
O componente `PrivateRoute` protege todas as rotas autenticadas:
- Verifica `accessToken` no `localStorage`.
- Se ausente, redireciona para `/login`.
- Renderiza o filho se autenticado.

### AppShell
O layout padrão das rotas privadas inclui:
- Sidebar colapsável com navegação principal.
- Header com perfil do usuário e botão de logout.
- Área de conteúdo principal.

---

## Fluxo de Dados

```
Componente/Página
    │
    ├── useHook() (src/hooks/)
    │       └── useQuery / useMutation (React Query)
    │               └── serviceFn() (src/services/)
    │                       └── api.get/post/patch/delete (src/lib/api.ts)
    │                               └── Axios → Backend REST API
    │
    └── Estado local (useState / useReducer) para UI efêmera
```

### Regras de dados
- **Dados do servidor** → sempre via React Query (cacheado, sincronizado).
- **Estado de formulário** → React Hook Form (performático, validado por Zod).
- **Estado de UI** (modal aberto, tab ativa) → `useState` local no componente.
- **Autenticação** → tokens em `localStorage`, lidos pelo `useAuth` hook.

---

## Autenticação

Os tokens JWT são armazenados no `localStorage`:
- `accessToken` — expiração de 7 dias.
- `refreshToken` — expiração de 30 dias.

O interceptor Axios em `src/lib/api.ts` injeta o `accessToken` em toda requisição:
```
request interceptor → Authorization: Bearer <accessToken>
response interceptor → status 401 → limpa tokens → redireciona /login
```

O hook `useAuth` provê:
- `user` — dados do usuário logado (via `GET /auth/me`).
- `isLoading` — estado de carregamento da sessão.
- `login(credentials)` — autentica e navega para `/dashboard`.
- `register(data)` — registra e navega para `/dashboard`.
- `logout()` — limpa tokens e navega para `/login`.

---

## Design System

Os tokens de design (cores, tipografia, espaçamentos, sombras) são definidos como **CSS custom properties** em `src/design-system/tokens.css`.

O Tailwind CSS 4 consome esses tokens diretamente, sem precisar de `tailwind.config.js` separado.

Dark mode é suportado via `.dark` class (gerenciado pelo `next-themes`).

---

## PWA e Offline

O `vite-plugin-pwa` gera o Service Worker e o manifesto automaticamente no build.

Estratégia de cache:
| Recurso | Estratégia |
|---|---|
| Assets estáticos (JS, CSS, imagens) | CacheFirst |
| Chamadas `/api/*` | NetworkFirst |

O hook `useCheckinQueue` gerencia a fila offline de check-ins:
1. Ao tentar fazer check-in sem rede, o token é salvo no **IndexedDB**.
2. Quando a rede volta, os tokens pendentes são processados automaticamente.
3. A `CheckinScannerPage` mostra o contador de check-ins na fila.

---

## Configuração Vite (`vite.config.ts`)

- Plugin `@vitejs/plugin-react` (Babel).
- Plugin `@tailwindcss/vite`.
- Plugin `vite-plugin-pwa` com manifest e SW customizado.
- Alias `@` → `src/` (use `@/components/...` em vez de `../../components/...`).
- Vitest configurado com `jsdom` para testes de componentes.
