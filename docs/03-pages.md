# Páginas

Referência de todas as páginas da aplicação, suas rotas, dados que carregam e o que renderizam.

---

## Páginas Públicas

### `LandingPage` — `/`
**Arquivo:** `src/pages/LandingPage.tsx`

Página de marketing do produto. Contém:
- Hero com CTA para cadastro.
- Seção de funcionalidades.
- Tabela de planos e preços.
- Footer.

Lê `localStorage` para verificar se o usuário já está logado e direcionar o CTA para `/dashboard` em vez de `/register`.

---

### `LoginPage` — `/login`
**Arquivo:** `src/pages/LoginPage.tsx`

Formulário de login (e-mail + senha). Usa `useAuth().login()`. Redireciona para `/dashboard` após sucesso.

---

### `RegisterPage` — `/register`
**Arquivo:** `src/pages/RegisterPage.tsx`

Formulário de cadastro (nome + e-mail + senha). Usa `useAuth().register()`. Redireciona para `/dashboard` após sucesso.

---

### `ForgotPasswordPage` — `/forgot-password`
**Arquivo:** `src/pages/ForgotPasswordPage.tsx`

Formulário de solicitação de redefinição de senha. Chama `POST /auth/forgot-password`.

---

### `ResetPasswordPage` — `/reset-password`
**Arquivo:** `src/pages/ResetPasswordPage.tsx`

Formulário de nova senha. Lê o token da query string (`?token=...`). Chama `POST /auth/reset-password`.

---

### `PublicEventPage` — `/e/:slug`
**Arquivo:** `src/pages/PublicEventPage.tsx` (516 linhas)

Página pública de inscrição no evento. A página mais complexa do lado público.

**Dados carregados:**
- Evento via `usePublicEvent(slug)` → `GET /events/public/:slug`
- Ingressos disponíveis via `useAvailableTickets(eventId)` → `GET /events/:eventId/tickets/available`

**O que renderiza:**
- Hero com banner do evento (ou layout split com logo).
- Blocos customizados do page builder (`BlockRenderers`).
- Seletor de ingresso com preço e disponibilidade.
- Formulário de inscrição com validação de CPF e telefone.
- Countdown para o início do evento.

**Fluxo de inscrição:**
1. Usuário seleciona ingresso.
2. Preenche nome, e-mail, CPF, telefone, cupom (opcional).
3. Submit → `POST /events/:eventId/participants`.
4. Navega para `/e/:slug/confirmacao` passando dados via `state`.

---

### `ConfirmationPage` — `/e/:slug/confirmacao`
**Arquivo:** `src/pages/ConfirmationPage.tsx`

Tela de confirmação pós-inscrição. Recebe os dados do participante via React Router `state`.

- Exibe mensagem de sucesso com nome do participante e evento.
- Botão para baixar certificado (se já disponível) via `GET /certificates/by-token/:qrToken`.
- Botão para compartilhar o link do evento.

---

### `NotFoundPage` — `*`
**Arquivo:** `src/pages/NotFoundPage.tsx`

Página 404 simples.

---

## Páginas Privadas (dentro do AppShell)

### `DashboardPage` — `/dashboard`
**Arquivo:** `src/pages/DashboardPage.tsx`

Listagem dos eventos do organizador.

**Dados carregados:** `useEvents()` → `GET /events/my?page&limit&status`

**Funcionalidades:**
- Filtro por status (Todos, Rascunho, Publicado, Finalizado, Cancelado).
- Paginação.
- Cards de evento com status badge, data, contagem de participantes.
- Botão "Criar evento" → `/events/new`.
- Click no card → `/events/:id`.

---

### `EventFormPage` — `/events/new` e `/events/:id/edit`
**Arquivo:** `src/pages/EventFormPage.tsx`

Formulário de criação e edição de evento.

**Dados carregados (edição):** `useEvent(id)` → `GET /events/:id`

**Campos do formulário:**
- Título, descrição
- Data início/fim, horário início/fim
- Localização (com `PlacesAutocomplete`) ou link online
- Máximo de participantes
- Carga horária (para certificados)

**Submit:**
- Criação → `POST /events` → redireciona para `/events/:id`.
- Edição → `PATCH /events/:id` → toast de sucesso.

---

### `EventDetailPage` — `/events/:id`
**Arquivo:** `src/pages/EventDetailPage.tsx` (~1.083 linhas)

Página central de gerenciamento de um evento. Organizada em **abas**:

| Aba | Conteúdo |
|---|---|
| **Detalhes** | Info do evento + upload de banner/logo + ações (publicar, cancelar) |
| **Ingressos** | CRUD de ingressos via `TicketFormModal` |
| **Participantes** | Tabela paginada, filtros, edição, cancelamento, importação/exportação CSV |
| **Cupons** | CRUD de cupons via `CouponFormModal` |
| **Parceiros** | CRUD de parceiros/patrocinadores via `PartnerFormModal` |
| **Assinantes** | CRUD de assinantes do certificado via `SignerFormModal` |
| **Certificado** | `CertificateStudioTab` — estúdio de design do certificado |
| **Página** | `PageBuilderTab` — construtor da página pública do evento |

**Hooks utilizados:**
- `useEvent(id)`, `useUpdateEvent(id)`, `usePublishEvent(id)`, `useCancelEvent(id)`
- `useUploadEventImage(id)`
- `useTickets(id)`, `useCreateTicket`, `useUpdateTicket`, `useDeleteTicket`
- `useParticipants(id)`, `useUpdateParticipant`, `useCancelParticipant`, `useImportParticipantsCsv`
- `useCoupons(id)`, `useCreateCoupon`, `useUpdateCoupon`, `useDeactivateCoupon`
- `usePartners(id)`, `useCreatePartner`, `useUpdatePartner`, `useDeletePartner`, `useUploadPartnerLogo`
- `useSigners(id)`, `useCreateSigner`, `useUpdateSigner`, `useDeleteSigner`, `useUploadSignerSignature`
- `useConfirm()` para diálogos de confirmação

---

### `CertificateStudioTab`
**Arquivo:** `src/pages/CertificateStudioTab.tsx` (~1.282 linhas)

Estúdio de design embutido na aba "Certificado" do `EventDetailPage`.

**Funcionalidades:**
- Seleção de template (`DEFAULT`, `LANDSCAPE`, `MINIMALIST`).
- Cor primária do certificado.
- Marca d'água opcional.
- Editor de texto do corpo do certificado com variáveis (`{{nome}}`, `{{evento}}`, etc.).
- Preview em tempo real do certificado.
- Workflow de impressão/exportação.

Persiste alterações via `useUpdateEvent(id)` → `PATCH /events/:id`.

---

### `PageBuilderTab`
**Arquivo:** `src/pages/PageBuilderTab.tsx` (~306 linhas)

Construtor visual da página pública do evento, embutido na aba "Página".

**Funcionalidades:**
- Drag-and-drop de blocos (usando `@dnd-kit`).
- Tipos de bloco disponíveis: agenda, speakers, FAQ, galeria, patrocinadores, texto, vídeo, countdown.
- Modal de adição (`BlockPaletteModal`) e edição (`BlockEditModal`).
- Configurações globais: cor de fundo, fonte do título, layout do hero.

Persiste via `useUpdatePageBuilder(id)` → `PATCH /events/:id` (campo `pageBlocks` + `pageSettings`).

---

### `CertificateEditorPage` — `/events/:id/certificate-editor`
**Arquivo:** `src/pages/CertificateEditorPage.tsx` (~1.016 linhas)

Versão fullscreen do estúdio de certificados (fora do AppShell).

Funcionalidades idênticas ao `CertificateStudioTab`, porém em tela cheia para melhor experiência de design.

---

### `FinanceiroDashboardPage` — `/financeiro`
**Arquivo:** `src/pages/FinanceiroDashboardPage.tsx` (~422 linhas)

Dashboard financeiro do organizador.

**Dados carregados:** `useFinanceiro()` → `GET /financeiro`

**Renderiza:**
- Cards de KPIs: receita bruta total, taxa da plataforma, valor a receber.
- Tabela por evento com receita, taxa e repasse.
- Exportação de extrato em CSV.

---

## Páginas de Check-in (sem AppShell)

### `CheckinPage` — `/checkin`
**Arquivo:** `src/pages/CheckinPage.tsx` (~152 linhas)

Tela inicial do modo check-in. Lista os eventos do organizador prontos para check-in (`PUBLISHED` ou `ONGOING`).

- Mostra status da rede (online/offline).
- Mostra contador de check-ins na fila offline.
- Click no evento → `/checkin/:eventId`.

---

### `CheckinScannerPage` — `/checkin/:eventId`
**Arquivo:** `src/pages/CheckinScannerPage.tsx` (~487 linhas)

Scanner de check-in para um evento específico.

**Modos de check-in:**
| Modo | Como funciona |
|---|---|
| **QR Code** | Camera ativa com `QrScanner`. Ao detectar QR, chama `POST /checkin/:token` |
| **CPF** | Input de CPF com formatação automática. Chama `POST /checkin/by-cpf` |
| **Nome** | Input de nome. Chama `POST /checkin/by-name` |

**Funcionalidades:**
- Estatísticas em tempo real (polling a cada 5s via `useCheckinStats`).
- Suporte offline: se sem rede, enfileira o token no IndexedDB (`useCheckinQueue`).
- Card de resultado com nome do participante e status do check-in.
- Indicador de fila pendente de sincronização.
