# Tipos TypeScript

Referência completa de todos os tipos e interfaces usados na aplicação.

---

## Auth (`src/types/auth.ts`)

```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'ORGANIZER';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Inputs de formulário
interface LoginInput { email: string; password: string; }
interface RegisterInput { name: string; email: string; password: string; }
interface ForgotPasswordInput { email: string; }
interface ResetPasswordInput { token: string; newPassword: string; }
```

---

## Events (`src/types/events.ts`)

```typescript
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'FINISHED' | 'CANCELLED';
type CertificateTemplate = 'DEFAULT' | 'LANDSCAPE' | 'MINIMALIST';

interface EventSummary {
  id: string;
  slug: string;
  title: string;
  bannerUrl?: string;
  logoUrl?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  isOnline: boolean;
  status: EventStatus;
  _count?: { participants: number };
}

interface EventDetail extends EventSummary {
  description?: string;
  onlineLink?: string;
  minimumAttendancePercentage?: number;
  workloadHours?: number;
  isPublic: boolean;
  requiresApproval: boolean;
  maxParticipants?: number;
  hasPaidTickets: boolean;
  primaryColor?: string;
  certificateTemplate: CertificateTemplate;
  certificateBodyText?: string;
  pageBlocks?: PageBlock[];
  pageSettings?: PageSettings;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

interface EventsPage {
  data: EventSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Inputs de formulário
interface CreateEventInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  onlineLink?: string;
  isOnline?: boolean;
  maxParticipants?: number;
  workloadHours?: number;
}

type UpdateEventInput = Partial<CreateEventInput> & {
  certificateTemplate?: CertificateTemplate;
  certificateBodyText?: string;
  primaryColor?: string;
  pageBlocks?: PageBlock[];
  pageSettings?: PageSettings;
}
```

---

## Tickets (`src/types/tickets.ts`)

```typescript
interface Ticket {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  quantitySold: number;
  isActive: boolean;
  salesStartDate?: string;
  salesEndDate?: string;
  isHalfPrice: boolean;
  // campos derivados (retornados pelo endpoint /available):
  isSoldOut?: boolean;
  isOnSale?: boolean;
  effectivePrice?: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateTicketInput {
  name: string;
  description?: string;
  quantity: number;
  salesStartDate?: string;
  salesEndDate?: string;
}

type UpdateTicketInput = Partial<CreateTicketInput> & { isActive?: boolean };
```

---

## Participants (`src/types/participants.ts`)

```typescript
type ParticipantStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

interface Participant {
  id: string;
  eventId: string;
  ticketId: string;
  couponId?: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  status: ParticipantStatus;
  qrToken: string;
  checkedInAt?: string;
  certificateReleased: boolean;
  registeredAt: string;
  updatedAt: string;
  ticket?: { name: string };
}

interface CreateParticipantInput {
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  ticketId: string;
  couponCode?: string;
}

interface UpdateParticipantInput {
  name?: string;
  phone?: string;
  status?: ParticipantStatus;
  certificateReleased?: boolean;
}

interface ListParticipantsParams {
  page?: number;
  limit?: number;
  status?: ParticipantStatus;
  ticketId?: string;
  search?: string;
}

interface PaginatedParticipants {
  data: Participant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Coupons (`src/types/coupons.ts`)

```typescript
type DiscountType = 'PERCENTAGE' | 'FIXED';

interface Coupon {
  id: string;
  eventId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number;
  expiresAt?: string;
}

type UpdateCouponInput = Partial<CreateCouponInput>;
```

---

## Partners (`src/types/partners.ts`)

```typescript
interface EventPartner {
  id: string;
  eventId: string;
  name: string;
  logoUrl?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CreatePartnerInput { name: string; displayOrder?: number; }
type UpdatePartnerInput = Partial<CreatePartnerInput>;
```

---

## Signers (`src/types/signers.ts`)

```typescript
interface CertificateSigner {
  id: string;
  eventId: string;
  name: string;
  title: string;
  signatureUrl?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateSignerInput { name: string; title: string; displayOrder?: number; }
type UpdateSignerInput = Partial<CreateSignerInput>;
```

---

## Page Builder (`src/types/page-builder.ts`)

```typescript
type BlockType =
  | 'agenda'
  | 'speakers'
  | 'faq'
  | 'gallery'
  | 'sponsors'
  | 'text'
  | 'video'
  | 'countdown';

interface PageBlock {
  id: string;
  type: BlockType;
  data: AgendaData | SpeakersData | FaqData | GalleryData | SponsorsData | TextData | VideoData | CountdownData;
}

interface PageSettings {
  backgroundColor: string;
  titleFont: string;
  heroLayout: 'default' | 'split';
  // ...outras configurações visuais
}

// Constante com metadados de exibição de cada bloco:
const BLOCK_META: Record<BlockType, { label: string; icon: LucideIcon; color: string; defaultData: object }>

// Valor padrão das configurações de página:
const DEFAULT_PAGE_SETTINGS: PageSettings
```

### Formatos de data dos blocos

```typescript
// Agenda
interface AgendaData { items: { time: string; title: string; description?: string }[] }

// Speakers
interface SpeakersData { items: { name: string; bio?: string; photoUrl?: string; role?: string }[] }

// FAQ
interface FaqData { items: { question: string; answer: string }[] }

// Gallery
interface GalleryData { images: string[] }  // URLs

// Sponsors
interface SponsorsData { items: { name: string; logoUrl: string }[] }

// Text
interface TextData { content: string }  // HTML

// Video
interface VideoData { url: string }  // embed URL

// Countdown
interface CountdownData { targetDate: string }  // ISO 8601
```
