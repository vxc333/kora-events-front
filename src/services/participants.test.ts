import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import {
  getParticipants,
  createParticipant,
  updateParticipant,
  cancelParticipant,
  importParticipantsCsv,
  exportParticipantsCsv,
  downloadParticipantCertificate,
  approveParticipant,
  rejectParticipant,
} from './participants'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockParticipant = {
  id: 'p-1',
  name: 'Ana Lima',
  email: 'ana@test.com',
  status: 'CONFIRMED',
  eventId: 'ev-1',
}

const mockPaginated = { data: [mockParticipant], total: 1, page: 1, limit: 10 }

beforeEach(() => vi.clearAllMocks())

describe('getParticipants', () => {
  it('chama GET /events/:id/participants e retorna dados paginados', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginated })
    const result = await getParticipants('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/participants', { params: undefined })
    expect(result).toEqual(mockPaginated)
  })

  it('repassa params opcionais para a query', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginated })
    await getParticipants('ev-1', { page: 2, search: 'Ana' })
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/participants', {
      params: { page: 2, search: 'Ana' },
    })
  })
})

describe('createParticipant', () => {
  it('chama POST /events/:id/participants e retorna o participante criado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockParticipant })
    const input = { name: 'Ana Lima', email: 'ana@test.com', cpf: '123', phone: '11999' }
    const result = await createParticipant('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/participants', input)
    expect(result).toEqual(mockParticipant)
  })
})

describe('updateParticipant', () => {
  it('chama PATCH /events/:id/participants/:pid e retorna o participante atualizado', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: mockParticipant })
    const result = await updateParticipant('ev-1', 'p-1', { name: 'Novo Nome' })
    expect(api.patch).toHaveBeenCalledWith('/events/ev-1/participants/p-1', { name: 'Novo Nome' })
    expect(result).toEqual(mockParticipant)
  })
})

describe('cancelParticipant', () => {
  it('chama DELETE /events/:id/participants/:pid', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await cancelParticipant('ev-1', 'p-1')
    expect(api.delete).toHaveBeenCalledWith('/events/ev-1/participants/p-1')
  })
})

describe('importParticipantsCsv', () => {
  it('chama POST /events/:id/participants/csv com FormData e retorna contagem', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { imported: 5 } })
    const file = new File(['a,b'], 'lista.csv', { type: 'text/csv' })
    const result = await importParticipantsCsv('ev-1', file)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/participants/csv', expect.any(FormData))
    expect(result).toEqual({ imported: 5 })
  })
})

describe('exportParticipantsCsv', () => {
  it('chama GET /events/:id/participants/export com responseType blob', async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:url')
    URL.revokeObjectURL = vi.fn()
    const mockBlob = new Blob(['csv'])
    vi.mocked(api.get).mockResolvedValue({ data: mockBlob })
    await exportParticipantsCsv('ev-1', 'Meu Evento')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/participants/export', {
      responseType: 'blob',
    })
  })
})

describe('downloadParticipantCertificate', () => {
  it('chama GET /certificates/by-participant/:id com responseType blob', async () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:url')
    URL.revokeObjectURL = vi.fn()
    const mockBlob = new Blob(['pdf'])
    vi.mocked(api.get).mockResolvedValue({ data: mockBlob })
    await downloadParticipantCertificate('p-1', 'Ana Lima')
    expect(api.get).toHaveBeenCalledWith('/certificates/by-participant/p-1', {
      responseType: 'blob',
    })
  })
})

describe('approveParticipant', () => {
  it('chama POST /events/:id/participants/:pid/approve e retorna participante', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockParticipant })
    const result = await approveParticipant('ev-1', 'p-1')
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/participants/p-1/approve')
    expect(result).toEqual(mockParticipant)
  })
})

describe('rejectParticipant', () => {
  it('chama POST /events/:id/participants/:pid/reject e retorna participante', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockParticipant })
    const result = await rejectParticipant('ev-1', 'p-1')
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/participants/p-1/reject')
    expect(result).toEqual(mockParticipant)
  })
})
