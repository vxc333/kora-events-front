import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventDetailPage } from './EventDetailPage'
import * as useEventModule from '@/hooks/useEvent'
import * as useTicketsModule from '@/hooks/useTickets'
import * as useCouponsModule from '@/hooks/useCoupons'
import * as useParticipantsModule from '@/hooks/useParticipants'
import * as usePartnersModule from '@/hooks/usePartners'
import * as useSignersModule from '@/hooks/useSigners'
import type { EventDetail } from '@/types/events'
import type { Ticket } from '@/types/tickets'

vi.mock('@/hooks/useEvent')
vi.mock('@/hooks/useTickets')
vi.mock('@/hooks/useCoupons')
vi.mock('@/hooks/useParticipants')
vi.mock('@/hooks/usePartners')
vi.mock('@/hooks/useSigners')

const mockEvent: EventDetail = {
  id: 'uuid-1', slug: 'festival-tech-2026', title: 'Festival Tech 2026',
  description: 'Maior festival de tecnologia do Brasil.', status: 'DRAFT',
  bannerUrl: null, logoUrl: null, startDate: '2026-06-01T00:00:00.000Z',
  endDate: '2026-06-02T00:00:00.000Z', startTime: '09:00', endTime: '18:00',
  location: 'Av. Paulista, 1000', onlineLink: null, isOnline: false,
  minimumAttendancePercentage: 75, workloadHours: 8, isPublic: true,
  requiresApproval: false, maxParticipants: null, primaryColor: '#6366f1',
  certificateTemplate: 'DEFAULT', organizerId: 'org-1',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockTicket: Ticket = {
  id: 'ticket-1', name: 'Ingresso Padrão', description: null, price: 0,
  currency: 'BRL', quantity: 100, quantitySold: 5, isActive: true,
  salesStartDate: null, salesEndDate: null, isHalfPrice: false,
  discountCode: null, discountPercentage: null, eventId: 'uuid-1',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockPublish = vi.fn()
const mockCancel = vi.fn()

function setupMocks(event = mockEvent, tickets: Ticket[] = []) {
  vi.mocked(useEventModule.useEvent).mockReturnValue({ event, isLoading: false })
  vi.mocked(useEventModule.usePublishEvent).mockReturnValue({ publish: mockPublish, isPending: false })
  vi.mocked(useEventModule.useCancelEvent).mockReturnValue({ cancel: mockCancel, isPending: false })
  vi.mocked(useEventModule.useUploadEventImage).mockReturnValue({ upload: vi.fn(), isPending: false })
  vi.mocked(useEventModule.useDownloadAttendanceReport).mockReturnValue({ downloadReport: vi.fn(), isPending: false })
  vi.mocked(useEventModule.useUpdatePageBuilder).mockReturnValue({ savePage: vi.fn(), isPending: false })
  vi.mocked(useTicketsModule.useTickets).mockReturnValue({ tickets, isLoading: false })
  vi.mocked(useTicketsModule.useCreateTicket).mockReturnValue({ createTicket: vi.fn(), isPending: false })
  vi.mocked(useTicketsModule.useUpdateTicket).mockReturnValue({ updateTicket: vi.fn(), isPending: false })
  vi.mocked(useTicketsModule.useDeleteTicket).mockReturnValue({ deleteTicket: vi.fn(), isPending: false })
  vi.mocked(useCouponsModule.useCoupons).mockReturnValue({ coupons: [], isLoading: false })
  vi.mocked(useCouponsModule.useCreateCoupon).mockReturnValue({ createCoupon: vi.fn(), isPending: false })
  vi.mocked(useCouponsModule.useUpdateCoupon).mockReturnValue({ updateCoupon: vi.fn(), isPending: false })
  vi.mocked(useCouponsModule.useDeactivateCoupon).mockReturnValue({ deactivateCoupon: vi.fn(), isPending: false })
  vi.mocked(useParticipantsModule.useParticipants).mockReturnValue({ participants: [], total: 0, isLoading: false })
  vi.mocked(useParticipantsModule.useCreateParticipant).mockReturnValue({ createParticipant: vi.fn(), isPending: false })
  vi.mocked(useParticipantsModule.useUpdateParticipant).mockReturnValue({ updateParticipant: vi.fn(), isPending: false })
  vi.mocked(useParticipantsModule.useCancelParticipant).mockReturnValue({ cancelParticipant: vi.fn(), isPending: false })
  vi.mocked(useParticipantsModule.useImportParticipantsCsv).mockReturnValue({ importCsv: vi.fn(), isPending: false })
  vi.mocked(usePartnersModule.usePartners).mockReturnValue({ partners: [], isLoading: false })
  vi.mocked(usePartnersModule.useCreatePartner).mockReturnValue({ createPartner: vi.fn(), isPending: false })
  vi.mocked(usePartnersModule.useUpdatePartner).mockReturnValue({ updatePartner: vi.fn(), isPending: false })
  vi.mocked(usePartnersModule.useDeletePartner).mockReturnValue({ deletePartner: vi.fn(), isPending: false })
  vi.mocked(usePartnersModule.useUploadPartnerLogo).mockReturnValue({ uploadLogo: vi.fn(), isPending: false })
  vi.mocked(useSignersModule.useSigners).mockReturnValue({ signers: [], isLoading: false })
  vi.mocked(useSignersModule.useCreateSigner).mockReturnValue({ createSigner: vi.fn(), isPending: false })
  vi.mocked(useSignersModule.useUpdateSigner).mockReturnValue({ updateSigner: vi.fn(), isPending: false })
  vi.mocked(useSignersModule.useDeleteSigner).mockReturnValue({ deleteSigner: vi.fn(), isPending: false })
  vi.mocked(useSignersModule.useUploadSignerSignature).mockReturnValue({ uploadSignature: vi.fn(), isPending: false })
}

function renderPage(event = mockEvent, tickets: Ticket[] = []) {
  setupMocks(event, tickets)
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/events/uuid-1']}>
        <Routes><Route path="/events/:id" element={<EventDetailPage />} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => vi.clearAllMocks())

describe('EventDetailPage', () => {
  it('exibe skeleton durante carregamento', () => {
    vi.mocked(useEventModule.useEvent).mockReturnValue({ event: null, isLoading: true })
    vi.mocked(useEventModule.usePublishEvent).mockReturnValue({ publish: vi.fn(), isPending: false })
    vi.mocked(useEventModule.useCancelEvent).mockReturnValue({ cancel: vi.fn(), isPending: false })
    vi.mocked(useEventModule.useUploadEventImage).mockReturnValue({ upload: vi.fn(), isPending: false })
    vi.mocked(useTicketsModule.useTickets).mockReturnValue({ tickets: [], isLoading: false })
    vi.mocked(useTicketsModule.useCreateTicket).mockReturnValue({ createTicket: vi.fn(), isPending: false })
    vi.mocked(useTicketsModule.useUpdateTicket).mockReturnValue({ updateTicket: vi.fn(), isPending: false })
    vi.mocked(useTicketsModule.useDeleteTicket).mockReturnValue({ deleteTicket: vi.fn(), isPending: false })
    vi.mocked(useCouponsModule.useCoupons).mockReturnValue({ coupons: [], isLoading: false })
    vi.mocked(useCouponsModule.useCreateCoupon).mockReturnValue({ createCoupon: vi.fn(), isPending: false })
    vi.mocked(useCouponsModule.useUpdateCoupon).mockReturnValue({ updateCoupon: vi.fn(), isPending: false })
    vi.mocked(useCouponsModule.useDeactivateCoupon).mockReturnValue({ deactivateCoupon: vi.fn(), isPending: false })
    vi.mocked(useParticipantsModule.useParticipants).mockReturnValue({ participants: [], total: 0, isLoading: false })
    vi.mocked(useParticipantsModule.useCreateParticipant).mockReturnValue({ createParticipant: vi.fn(), isPending: false })
    vi.mocked(useParticipantsModule.useUpdateParticipant).mockReturnValue({ updateParticipant: vi.fn(), isPending: false })
    vi.mocked(useParticipantsModule.useCancelParticipant).mockReturnValue({ cancelParticipant: vi.fn(), isPending: false })
    vi.mocked(useParticipantsModule.useImportParticipantsCsv).mockReturnValue({ importCsv: vi.fn(), isPending: false })
    vi.mocked(usePartnersModule.usePartners).mockReturnValue({ partners: [], isLoading: false })
    vi.mocked(usePartnersModule.useCreatePartner).mockReturnValue({ createPartner: vi.fn(), isPending: false })
    vi.mocked(usePartnersModule.useUpdatePartner).mockReturnValue({ updatePartner: vi.fn(), isPending: false })
    vi.mocked(usePartnersModule.useDeletePartner).mockReturnValue({ deletePartner: vi.fn(), isPending: false })
    vi.mocked(usePartnersModule.useUploadPartnerLogo).mockReturnValue({ uploadLogo: vi.fn(), isPending: false })
    vi.mocked(useSignersModule.useSigners).mockReturnValue({ signers: [], isLoading: false })
    vi.mocked(useSignersModule.useCreateSigner).mockReturnValue({ createSigner: vi.fn(), isPending: false })
    vi.mocked(useSignersModule.useUpdateSigner).mockReturnValue({ updateSigner: vi.fn(), isPending: false })
    vi.mocked(useSignersModule.useDeleteSigner).mockReturnValue({ deleteSigner: vi.fn(), isPending: false })
    vi.mocked(useSignersModule.useUploadSignerSignature).mockReturnValue({ uploadSignature: vi.fn(), isPending: false })
    vi.mocked(useEventModule.useDownloadAttendanceReport).mockReturnValue({ downloadReport: vi.fn(), isPending: false })
    vi.mocked(useEventModule.useUpdatePageBuilder).mockReturnValue({ savePage: vi.fn(), isPending: false })
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/events/uuid-1']}><Routes><Route path="/events/:id" element={<EventDetailPage />} /></Routes></MemoryRouter>
      </QueryClientProvider>
    )
    expect(screen.getByTestId('detail-skeleton')).toBeInTheDocument()
  })

  it('exibe título e status do evento', () => {
    renderPage()
    expect(screen.getByText('Festival Tech 2026')).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('exibe botão Publicar para evento DRAFT', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument()
  })

  it('chama publish ao clicar em Publicar', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /publicar/i }))
    expect(mockPublish).toHaveBeenCalledOnce()
  })

  it('não exibe botão Publicar para evento PUBLISHED', () => {
    renderPage({ ...mockEvent, status: 'PUBLISHED' })
    expect(screen.queryByRole('button', { name: /publicar/i })).not.toBeInTheDocument()
  })

  it('exibe link para editar o evento', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /editar/i })).toHaveAttribute('href', '/events/uuid-1/edit')
  })

  it('exibe link para voltar ao dashboard', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /meus eventos/i })).toHaveAttribute('href', '/dashboard')
  })

  it('exibe seção Ingressos com botão Adicionar ingresso', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('tab', { name: /ingressos/i }))
    expect(screen.getByRole('button', { name: /adicionar ingresso/i })).toBeInTheDocument()
  })

  it('lista ingressos existentes', async () => {
    renderPage(mockEvent, [mockTicket])
    await userEvent.click(screen.getByRole('tab', { name: /ingressos/i }))
    expect(screen.getByText('Ingresso Padrão')).toBeInTheDocument()
  })

  it('abre modal ao clicar em Adicionar ingresso', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('tab', { name: /ingressos/i }))
    await userEvent.click(screen.getByRole('button', { name: /adicionar ingresso/i }))
    expect(screen.getByRole('heading', { name: /novo ingresso/i })).toBeInTheDocument()
  })
})
