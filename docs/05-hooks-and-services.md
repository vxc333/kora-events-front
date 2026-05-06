# Hooks e Serviços

Referência completa da camada de dados: hooks React Query e funções de serviço (API).

---

## Camada de Serviços (`src/services/`)

As funções de serviço são chamadas puras que fazem requisições HTTP via Axios. São usadas pelos hooks React Query.

### `src/lib/api.ts` — Instância Axios

```typescript
// Base URL configurada via VITE_API_URL
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Injeta token em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → limpa tokens e redireciona para /login
api.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

---

### `services/auth.ts`

| Função | Método | Endpoint |
|---|---|---|
| `login(credentials)` | POST | `/auth/login` |
| `register(data)` | POST | `/auth/register` |
| `getMe()` | GET | `/auth/me` |
| `forgotPassword(email)` | POST | `/auth/forgot-password` |
| `resetPassword(data)` | POST | `/auth/reset-password` |

---

### `services/events.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getMyEvents(params)` | GET | `/events/my?page&limit&status` |
| `getEvent(id)` | GET | `/events/:id` |
| `createEvent(data)` | POST | `/events` |
| `updateEvent(id, data)` | PATCH | `/events/:id` |
| `publishEvent(id)` | POST | `/events/:id/publish` |
| `cancelEvent(id)` | DELETE | `/events/:id` |
| `uploadEventBanner(id, file)` | POST | `/events/:id/banner` |
| `uploadEventLogo(id, file)` | POST | `/events/:id/logo` |
| `downloadAttendanceReport(id)` | GET | `/events/:id/reports/attendance` (blob) |

---

### `services/tickets.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getTickets(eventId)` | GET | `/events/:eventId/tickets` |
| `createTicket(eventId, data)` | POST | `/events/:eventId/tickets` |
| `updateTicket(eventId, ticketId, data)` | PATCH | `/events/:eventId/tickets/:ticketId` |
| `deleteTicket(eventId, ticketId)` | DELETE | `/events/:eventId/tickets/:ticketId` |

---

### `services/coupons.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getCoupons(eventId)` | GET | `/events/:eventId/coupons` |
| `createCoupon(eventId, data)` | POST | `/events/:eventId/coupons` |
| `updateCoupon(eventId, couponId, data)` | PATCH | `/events/:eventId/coupons/:couponId` |
| `deactivateCoupon(eventId, couponId)` | DELETE | `/events/:eventId/coupons/:couponId` |

---

### `services/participants.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getParticipants(eventId, params)` | GET | `/events/:eventId/participants?page&limit&status&search` |
| `createParticipant(eventId, data)` | POST | `/events/:eventId/participants` |
| `updateParticipant(eventId, id, data)` | PATCH | `/events/:eventId/participants/:id` |
| `cancelParticipant(eventId, id)` | DELETE | `/events/:eventId/participants/:id` |
| `importParticipantsCsv(eventId, file)` | POST | `/events/:eventId/participants/csv` |
| `exportParticipants(eventId)` | GET | `/events/:eventId/participants/export` (blob) |
| `downloadCertificate(participantId)` | GET | `/certificates/by-participant/:participantId` (blob) |

---

### `services/public.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getPublicEvent(slug)` | GET | `/events/public/:slug` |
| `getAvailableTickets(eventId)` | GET | `/events/:eventId/tickets/available` |
| `registerParticipant(eventId, data)` | POST | `/events/:eventId/participants` |

---

### `services/checkin.ts`

| Função | Método | Endpoint |
|---|---|---|
| `performCheckin(token)` | POST | `/checkin/:token` |
| `checkinByCpf(data)` | POST | `/checkin/by-cpf` |
| `checkinByName(data)` | POST | `/checkin/by-name` |
| `getCheckinStats(eventId)` | GET | `/events/:eventId/checkin/stats` |

---

### `services/partners.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getPartners(eventId)` | GET | `/events/:eventId/partners` |
| `createPartner(eventId, data)` | POST | `/events/:eventId/partners` |
| `updatePartner(eventId, partnerId, data)` | PATCH | `/events/:eventId/partners/:partnerId` |
| `deletePartner(eventId, partnerId)` | DELETE | `/events/:eventId/partners/:partnerId` |
| `uploadPartnerLogo(eventId, partnerId, file)` | POST | `/events/:eventId/partners/:partnerId/logo` |

---

### `services/signers.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getSigners(eventId)` | GET | `/events/:eventId/signers` |
| `createSigner(eventId, data)` | POST | `/events/:eventId/signers` |
| `updateSigner(eventId, signerId, data)` | PATCH | `/events/:eventId/signers/:signerId` |
| `deleteSigner(eventId, signerId)` | DELETE | `/events/:eventId/signers/:signerId` |
| `uploadSignerSignature(eventId, signerId, file)` | POST | `/events/:eventId/signers/:signerId/signature` |

---

### `services/financeiro.ts`

| Função | Método | Endpoint |
|---|---|---|
| `getFinancialSummary()` | GET | `/financeiro` |

---

## Hooks (`src/hooks/`)

Os hooks encapsulam React Query (`useQuery` / `useMutation`) com invalidação de cache automática.

---

### `useAuth`
**Arquivo:** `src/hooks/useAuth.ts`

```typescript
const { user, isLoading, login, register, logout } = useAuth();
```

| Retorno | Tipo | Descrição |
|---|---|---|
| `user` | `User \| null` | Dados do usuário autenticado |
| `isLoading` | `boolean` | Carregando sessão inicial |
| `login(credentials)` | Mutation | Salva tokens → navega `/dashboard` |
| `register(data)` | Mutation | Cria conta + salva tokens → navega `/dashboard` |
| `logout()` | Função | Limpa localStorage → navega `/login` |

A sessão é carregada via `GET /auth/me` com React Query (cacheada).

---

### `useEvents`
**Arquivo:** `src/hooks/useEvents.ts`

```typescript
const { data, isLoading } = useEvents({ page, limit, status });
```

Lista eventos do organizador paginada.

---

### `useEvent`
**Arquivo:** `src/hooks/useEvent.ts`

```typescript
const { data: event, isLoading } = useEvent(id);
const { mutate: updateEvent } = useUpdateEvent(id);
const { mutate: publishEvent } = usePublishEvent(id);
const { mutate: cancelEvent } = useCancelEvent(id);
const { mutate: uploadImage } = useUploadEventImage(id);
const { mutate: updatePageBuilder } = useUpdatePageBuilder(id);
const { mutate: downloadReport } = useDownloadAttendanceReport(eventId);
```

Todas as mutations invalidam o cache do evento após sucesso.

---

### `useTickets`
**Arquivo:** `src/hooks/useTickets.ts`

```typescript
const { data: tickets } = useTickets(eventId);
const { mutate: createTicket, isPending } = useCreateTicket(eventId);
const { mutate: updateTicket } = useUpdateTicket(eventId);
const { mutate: deleteTicket } = useDeleteTicket(eventId);
```

---

### `useParticipants`
**Arquivo:** `src/hooks/useParticipants.ts`

```typescript
const { data } = useParticipants(eventId, { page, limit, status, search });
const { mutate: createParticipant } = useCreateParticipant(eventId);
const { mutate: updateParticipant } = useUpdateParticipant(eventId);
const { mutate: cancelParticipant } = useCancelParticipant(eventId);
const { mutate: importCsv } = useImportParticipantsCsv(eventId);
```

---

### `useCoupons`
**Arquivo:** `src/hooks/useCoupons.ts`

```typescript
const { data: coupons } = useCoupons(eventId);
const { mutate: createCoupon } = useCreateCoupon(eventId);
const { mutate: updateCoupon } = useUpdateCoupon(eventId);
const { mutate: deactivateCoupon } = useDeactivateCoupon(eventId);
```

---

### `usePartners`
**Arquivo:** `src/hooks/usePartners.ts`

```typescript
const { data: partners } = usePartners(eventId);
const { mutate: createPartner } = useCreatePartner(eventId);
const { mutate: updatePartner } = useUpdatePartner(eventId);
const { mutate: deletePartner } = useDeletePartner(eventId);
const { mutate: uploadLogo } = useUploadPartnerLogo(eventId);
```

---

### `useSigners`
**Arquivo:** `src/hooks/useSigners.ts`

```typescript
const { data: signers } = useSigners(eventId);
const { mutate: createSigner } = useCreateSigner(eventId);
const { mutate: updateSigner } = useUpdateSigner(eventId);
const { mutate: deleteSigner } = useDeleteSigner(eventId);
const { mutate: uploadSignature } = useUploadSignerSignature(eventId);
```

---

### `useFinanceiro`
**Arquivo:** `src/hooks/useFinanceiro.ts`

```typescript
const { data: summary, isLoading } = useFinanceiro();
```

---

### `usePublicEvent`
**Arquivo:** `src/hooks/usePublicEvent.ts`

```typescript
const { data: event } = usePublicEvent(slug);
const { data: tickets } = useAvailableTickets(eventId);
const { mutate: register } = usePublicRegister(eventId);
// register() navega para /e/:slug/confirmacao após sucesso
```

---

### `useCheckinQueue`
**Arquivo:** `src/hooks/useCheckinQueue.ts`

Hook crítico para a funcionalidade offline do check-in.

```typescript
const {
  enqueue,       // adiciona token à fila offline (IndexedDB)
  syncQueue,     // processa todos os pendentes
  queueSize,     // número de check-ins na fila
  isSyncing,     // sincronização em andamento
} = useCheckinQueue();
```

**Fluxo offline:**
1. `CheckinScannerPage` detecta QR Code.
2. Se offline → `enqueue(token)` → salva no IndexedDB.
3. Quando online → `syncQueue()` → chama `POST /checkin/:token` para cada pendente.
4. Remove da fila os bem-sucedidos.

---

### `useCheckinStats`
**Arquivo:** `src/hooks/useCheckinStats.ts`

```typescript
const { data: stats } = useCheckinStats(eventId);
// stats = { total: number, checkedIn: number, pending: number }
```

Polling automático a cada **5 segundos** via `refetchInterval: 5000`.

---

### `useConfirm`
**Arquivo:** `src/hooks/useConfirm.tsx`

Documentado em [04-components.md](04-components.md#useconfirm).

---

## Utilitários (`src/lib/`)

### `src/lib/utils.ts`

```typescript
// Mescla classes Tailwind de forma segura
cn(...inputs: ClassValue[]): string

// Resolve URL de mídia: '/uploads/foto.jpg' → 'http://localhost:3333/uploads/foto.jpg'
getMediaUrl(path: string): string
```

### `src/lib/uuid.ts`
```typescript
randomUUID(): string  // wrapper de crypto.randomUUID()
```
