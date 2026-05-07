import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useFinanceiro } from './useFinanceiro'
import * as financeiroService from '@/services/financeiro'
import type { FinanceiroSummary } from '@/services/financeiro'

vi.mock('@/services/financeiro')

const mockSummary: FinanceiroSummary = {
  receitaBruta: 10000,
  taxaPlataforma: 500,
  valorRepassar: 9500,
  totalIngressosPagos: 20,
  totalEventos: 3,
  extrato: [
    {
      eventId: 'event-1',
      eventTitle: 'Evento Teste',
      eventDate: '2026-06-01T00:00:00.000Z',
      eventStatus: 'PUBLISHED',
      ingressosVendidos: 20,
      ingressosPagos: 20,
      receitaBruta: 10000,
      taxaPlataforma: 500,
      valorRepassar: 9500,
    },
  ],
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useFinanceiro', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna summary como undefined antes de resolver', () => {
    vi.mocked(financeiroService.getFinancialSummary).mockResolvedValue(mockSummary)
    const { result } = renderHook(() => useFinanceiro(), { wrapper: makeWrapper() })
    expect(result.current.summary).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
  })

  it('retorna resumo financeiro após query resolver', async () => {
    vi.mocked(financeiroService.getFinancialSummary).mockResolvedValue(mockSummary)
    const { result } = renderHook(() => useFinanceiro(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.summary?.receitaBruta).toBe(10000)
    expect(result.current.summary?.valorRepassar).toBe(9500)
    expect(result.current.summary?.extrato).toHaveLength(1)
    expect(result.current.isError).toBe(false)
  })

  it('define isError como true quando a query falha', async () => {
    vi.mocked(financeiroService.getFinancialSummary).mockRejectedValue(new Error('Erro de rede'))
    const { result } = renderHook(() => useFinanceiro(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isError).toBe(true)
    expect(result.current.summary).toBeUndefined()
  })
})
