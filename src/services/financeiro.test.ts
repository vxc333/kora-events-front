import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getFinancialSummary } from './financeiro'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockSummary = {
  receitaBruta: 5000,
  taxaPlataforma: 250,
  valorRepassar: 4750,
  totalIngressosPagos: 100,
  totalEventos: 3,
  extrato: [],
}

beforeEach(() => vi.clearAllMocks())

describe('getFinancialSummary', () => {
  it('chama GET /financeiro e retorna o resumo financeiro', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockSummary })
    const result = await getFinancialSummary()
    expect(api.get).toHaveBeenCalledWith('/financeiro')
    expect(result).toEqual(mockSummary)
  })
})
