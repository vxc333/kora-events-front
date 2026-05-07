import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConfirmationPage } from './ConfirmationPage'
import * as usePublicEventModule from '@/hooks/usePublicEvent'

vi.mock('@/hooks/usePublicEvent')
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: new Blob() }),
  },
}))
vi.mock('@/services/notifications', () => ({
  getParticipantNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue({}),
  markAllNotificationsRead: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/services/transfers', () => ({
  initiateTransfer: vi.fn().mockResolvedValue({}),
}))
vi.mock('@/services/pushNotifications', () => ({
  registerPushToken: vi.fn().mockResolvedValue({}),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockRegistration = {
  id: 'reg1',
  qrToken: 'qr-abc-123',
  name: 'Maria Souza',
  email: 'maria@test.com',
  status: 'CONFIRMED' as const,
  eventId: 'ev1',
  checkedInAt: null,
  certificateReleased: false,
}

const mockEvent = {
  id: 'ev1',
  title: 'Evento Confirmado',
  description: 'Desc',
  slug: 'evento-confirmado',
  startDate: '2026-09-01',
  endDate: '2026-09-01',
  startTime: '08:00',
  endTime: null,
  location: 'Rio de Janeiro',
  isOnline: false,
  bannerUrl: null,
  logoUrl: null,
  primaryColor: '#5B21B6',
  workloadHours: null,
  pageSettings: null,
  pageBlocks: [],
}

function renderConfirmation(registration = mockRegistration) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/e/evento-confirmado/confirmacao', state: { registration } }]}
    >
      <Routes>
        <Route path="/e/:slug/confirmacao" element={<ConfirmationPage />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(usePublicEventModule.usePublicEvent).mockReturnValue({
    event: mockEvent as never,
    isLoading: false,
  })
})

describe('ConfirmationPage', () => {
  it('renderiza o heading "Inscrição realizada!"', () => {
    renderConfirmation()
    expect(screen.getByText('Inscrição realizada!')).toBeInTheDocument()
  })

  it('exibe o nome do participante nos detalhes', () => {
    renderConfirmation()
    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
  })

  it('exibe o email do participante', () => {
    renderConfirmation()
    expect(screen.getByText('maria@test.com')).toBeInTheDocument()
  })

  it('renderiza o link "Voltar ao evento"', () => {
    renderConfirmation()
    const link = screen.getByRole('link', { name: /voltar ao evento/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/e/evento-confirmado')
  })

  it('exibe mensagem de "Nenhuma inscrição encontrada" quando não há registration no state', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/e/evento-confirmado/confirmacao', state: {} }]}>
        <Routes>
          <Route path="/e/:slug/confirmacao" element={<ConfirmationPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Nenhuma inscrição encontrada.')).toBeInTheDocument()
  })
})
