import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventFormPage } from './EventFormPage'
import * as useEventModule from '@/hooks/useEvent'
import type { EventDetail } from '@/types/events'

vi.mock('@/hooks/useEvent')

const mockEvent: EventDetail = {
  id: 'uuid-1',
  slug: 'festival-tech-2026',
  title: 'Festival Tech 2026',
  description: 'Maior festival de tecnologia do Brasil.',
  status: 'DRAFT',
  bannerUrl: null,
  logoUrl: null,
  startDate: '2026-06-01T00:00:00.000Z',
  endDate: '2026-06-02T00:00:00.000Z',
  startTime: '09:00',
  endTime: '18:00',
  location: 'Av. Paulista, 1000',
  onlineLink: null,
  isOnline: false,
  minimumAttendancePercentage: 75,
  workloadHours: 8,
  isPublic: true,
  requiresApproval: false,
  maxParticipants: null,
  primaryColor: '#6366f1',
  certificateTemplate: 'DEFAULT',
  organizerId: 'org-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockCreateEvent = vi.fn()
const mockUpdateEvent = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useEventModule.useCreateEvent).mockReturnValue({
    createEvent: mockCreateEvent,
    isPending: false,
    error: null,
  })
  vi.mocked(useEventModule.useUpdateEvent).mockReturnValue({
    updateEvent: mockUpdateEvent,
    isPending: false,
    error: null,
  })
  vi.mocked(useEventModule.useEvent).mockReturnValue({ event: null, isLoading: false })
})

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText(/título/i), 'Festival Tech 2026')
  await userEvent.type(screen.getByLabelText(/descrição/i), 'Maior festival')
  await userEvent.type(screen.getByLabelText(/data de início/i), '2026-06-01')
  await userEvent.type(screen.getByLabelText(/data de término/i), '2026-06-02')
  await userEvent.type(screen.getByLabelText(/horário de início/i), '09:00')
  await userEvent.type(screen.getByLabelText(/horário de término/i), '18:00')
  await userEvent.clear(screen.getByLabelText(/carga horária/i))
  await userEvent.type(screen.getByLabelText(/carga horária/i), '8')
}

describe('EventFormPage — create mode', () => {
  function renderCreate() {
    return render(
      <MemoryRouter initialEntries={['/events/new']}>
        <Routes>
          <Route path="/events/new" element={<EventFormPage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('exibe erro de validação para título vazio', async () => {
    renderCreate()
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(await screen.findByText('Título obrigatório')).toBeInTheDocument()
  })

  it('exibe erro de validação para descrição vazia', async () => {
    renderCreate()
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(await screen.findByText('Descrição obrigatória')).toBeInTheDocument()
  })

  it('chama createEvent com dados corretos ao salvar', async () => {
    renderCreate()
    await fillRequiredFields()
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Festival Tech 2026', workloadHours: 8 }),
        expect.anything()
      )
    })
  })

  it('exibe heading "Novo evento"', () => {
    renderCreate()
    expect(screen.getByRole('heading', { name: /novo evento/i })).toBeInTheDocument()
  })
})

describe('EventFormPage — edit mode', () => {
  function renderEdit() {
    return render(
      <MemoryRouter initialEntries={['/events/uuid-1/edit']}>
        <Routes>
          <Route path="/events/:id/edit" element={<EventFormPage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('pré-preenche o formulário com dados do evento', async () => {
    vi.mocked(useEventModule.useEvent).mockReturnValue({ event: mockEvent, isLoading: false })
    renderEdit()
    await waitFor(() => {
      expect(screen.getByLabelText(/título/i)).toHaveValue('Festival Tech 2026')
    })
    expect(screen.getByLabelText(/carga horária/i)).toHaveValue(8)
  })

  it('chama updateEvent ao salvar em modo edição', async () => {
    vi.mocked(useEventModule.useEvent).mockReturnValue({ event: mockEvent, isLoading: false })
    renderEdit()
    await waitFor(() => expect(screen.getByLabelText(/título/i)).toHaveValue('Festival Tech 2026'))
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Festival Tech 2026' }),
        expect.anything()
      )
    })
  })

  it('exibe heading "Editar evento"', async () => {
    vi.mocked(useEventModule.useEvent).mockReturnValue({ event: mockEvent, isLoading: false })
    renderEdit()
    expect(screen.getByRole('heading', { name: /editar evento/i })).toBeInTheDocument()
  })
})
