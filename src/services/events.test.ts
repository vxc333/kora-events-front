import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getMyEvents, getEvent, createEvent, updateEvent, publishEvent, cancelEvent, uploadEventImage } from './events'
import type { EventsPage, EventDetail } from '@/types/events'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockPage: EventsPage = {
  data: [
    {
      id: '1', title: 'Evento Alpha', status: 'PUBLISHED',
      startDate: '2026-06-01T00:00:00.000Z', endDate: '2026-06-01T00:00:00.000Z',
      location: 'São Paulo', isOnline: false,
    },
  ],
  total: 1, page: 1, limit: 10,
}

const mockEventDetail: EventDetail = {
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

beforeEach(() => vi.clearAllMocks())

describe('getMyEvents', () => {
  it('chama GET /events/my com params padrão', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage })
    const result = await getMyEvents({})
    expect(api.get).toHaveBeenCalledWith('/events/my', { params: { page: 1, limit: 10, status: undefined } })
    expect(result).toEqual(mockPage)
  })

  it('inclui status nos params quando fornecido', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage })
    await getMyEvents({ status: 'PUBLISHED' })
    expect(api.get).toHaveBeenCalledWith('/events/my', {
      params: { page: 1, limit: 10, status: 'PUBLISHED' },
    })
  })

  it('usa page e limit customizados', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPage })
    await getMyEvents({ page: 2, limit: 5 })
    expect(api.get).toHaveBeenCalledWith('/events/my', { params: { page: 2, limit: 5, status: undefined } })
  })
})

describe('getEvent', () => {
  it('chama GET /events/:id e retorna EventDetail', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockEventDetail })
    const result = await getEvent('uuid-1')
    expect(api.get).toHaveBeenCalledWith('/events/uuid-1')
    expect(result).toEqual(mockEventDetail)
  })
})

describe('createEvent', () => {
  it('chama POST /events com body e retorna EventDetail', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockEventDetail })
    const input = {
      title: 'Festival Tech 2026',
      description: 'Maior festival',
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-06-02T00:00:00.000Z',
      startTime: '09:00',
      endTime: '18:00',
      workloadHours: 8,
    }
    const result = await createEvent(input)
    expect(api.post).toHaveBeenCalledWith('/events', input)
    expect(result).toEqual(mockEventDetail)
  })
})

describe('updateEvent', () => {
  it('chama PATCH /events/:id com body e retorna EventDetail', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: mockEventDetail })
    const result = await updateEvent('uuid-1', { title: 'Novo Título' })
    expect(api.patch).toHaveBeenCalledWith('/events/uuid-1', { title: 'Novo Título' })
    expect(result).toEqual(mockEventDetail)
  })
})

describe('publishEvent', () => {
  it('chama POST /events/:id/publish e retorna EventDetail', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockEventDetail, status: 'PUBLISHED' } })
    const result = await publishEvent('uuid-1')
    expect(api.post).toHaveBeenCalledWith('/events/uuid-1/publish')
    expect(result.status).toBe('PUBLISHED')
  })
})

describe('cancelEvent', () => {
  it('chama DELETE /events/:id e retorna EventDetail', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { ...mockEventDetail, status: 'CANCELLED' } })
    const result = await cancelEvent('uuid-1')
    expect(api.delete).toHaveBeenCalledWith('/events/uuid-1')
    expect(result.status).toBe('CANCELLED')
  })
})

describe('uploadEventImage', () => {
  it('chama POST /events/:id/banner com FormData', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockEventDetail, bannerUrl: '/uploads/events/img.jpg' } })
    const file = new File(['img'], 'img.jpg', { type: 'image/jpeg' })
    const result = await uploadEventImage('uuid-1', 'banner', file)
    expect(api.post).toHaveBeenCalledWith('/events/uuid-1/banner', expect.any(FormData))
    expect(result.bannerUrl).toBe('/uploads/events/img.jpg')
  })
})
