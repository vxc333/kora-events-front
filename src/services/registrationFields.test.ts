import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import {
  getRegistrationFields,
  createRegistrationField,
  updateRegistrationField,
  deleteRegistrationField,
} from './registrationFields'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockField = {
  id: 'rf-1',
  label: 'Empresa',
  type: 'TEXT' as const,
  required: false,
  options: null,
  order: 1,
  eventId: 'ev-1',
}

beforeEach(() => vi.clearAllMocks())

describe('getRegistrationFields', () => {
  it('chama GET /events/:id/registration-fields e retorna lista de campos', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockField] })
    const result = await getRegistrationFields('ev-1')
    expect(api.get).toHaveBeenCalledWith('/events/ev-1/registration-fields')
    expect(result).toEqual([mockField])
  })
})

describe('createRegistrationField', () => {
  it('chama POST /events/:id/registration-fields e retorna o campo criado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockField })
    const input = { label: 'Empresa', type: 'TEXT' as const }
    const result = await createRegistrationField('ev-1', input)
    expect(api.post).toHaveBeenCalledWith('/events/ev-1/registration-fields', input)
    expect(result).toEqual(mockField)
  })
})

describe('updateRegistrationField', () => {
  it('chama PATCH /events/:id/registration-fields/:fid e retorna o campo atualizado', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: mockField })
    const result = await updateRegistrationField('ev-1', 'rf-1', { required: true })
    expect(api.patch).toHaveBeenCalledWith('/events/ev-1/registration-fields/rf-1', { required: true })
    expect(result).toEqual(mockField)
  })
})

describe('deleteRegistrationField', () => {
  it('chama DELETE /events/:id/registration-fields/:fid', async () => {
    vi.mocked(api.delete).mockResolvedValue({})
    await deleteRegistrationField('ev-1', 'rf-1')
    expect(api.delete).toHaveBeenCalledWith('/events/ev-1/registration-fields/rf-1')
  })
})
