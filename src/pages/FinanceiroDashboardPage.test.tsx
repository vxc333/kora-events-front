import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinanceiroDashboardPage } from './FinanceiroDashboardPage'
import * as useFinanceiroModule from '@/hooks/useFinanceiro'

vi.mock('@/hooks/useFinanceiro')

const mockExtrato = [
  {
    eventId: 'ev1',
    eventTitle: 'Evento Teste',
    eventDate: '2026-03-15T00:00:00.000Z',
    eventStatus: 'FINISHED',
    ingressosVendidos: 50,
    receitaBruta: 500000,
    taxaPlataforma: 25000,
    valorRepassar: 475000,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FinanceiroDashboardPage', () => {
  it('renderiza o título da página', () => {
    vi.mocked(useFinanceiroModule.useFinanceiro).mockReturnValue({
      summary: { extrato: mockExtrato },
      isLoading: false,
      isError: false,
    })
    render(<MemoryRouter><FinanceiroDashboardPage /></MemoryRouter>)
    expect(screen.getByText('Financeiro')).toBeInTheDocument()
  })

  it('renderiza os cards de KPI com labels', () => {
    vi.mocked(useFinanceiroModule.useFinanceiro).mockReturnValue({
      summary: { extrato: mockExtrato },
      isLoading: false,
      isError: false,
    })
    render(<MemoryRouter><FinanceiroDashboardPage /></MemoryRouter>)
    // "Receita Bruta" appears as KPI label and as table column header
    expect(screen.getAllByText('Receita Bruta').length).toBeGreaterThan(0)
    expect(screen.getByText('Taxa da Plataforma')).toBeInTheDocument()
    expect(screen.getByText('Valor a Repassar')).toBeInTheDocument()
  })

  it('exibe skeleton durante estado de carregamento', () => {
    vi.mocked(useFinanceiroModule.useFinanceiro).mockReturnValue({
      summary: undefined,
      isLoading: true,
      isError: false,
    })
    render(<MemoryRouter><FinanceiroDashboardPage /></MemoryRouter>)
    // In loading state, the page renders multiple skeleton elements (using animate-pulse or rounded-md)
    const skeletons = document.querySelectorAll('.rounded-md, .rounded-lg')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('exibe mensagem de estado vazio quando não há dados no período', () => {
    vi.mocked(useFinanceiroModule.useFinanceiro).mockReturnValue({
      summary: { extrato: [] },
      isLoading: false,
      isError: false,
    })
    render(<MemoryRouter><FinanceiroDashboardPage /></MemoryRouter>)
    expect(screen.getByText('Nenhum dado no período')).toBeInTheDocument()
  })

  it('renderiza botão de exportar CSV', () => {
    vi.mocked(useFinanceiroModule.useFinanceiro).mockReturnValue({
      summary: { extrato: mockExtrato },
      isLoading: false,
      isError: false,
    })
    render(<MemoryRouter><FinanceiroDashboardPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument()
  })

  it('exibe o título do evento no extrato quando há dados', () => {
    vi.mocked(useFinanceiroModule.useFinanceiro).mockReturnValue({
      summary: { extrato: mockExtrato },
      isLoading: false,
      isError: false,
    })
    render(<MemoryRouter><FinanceiroDashboardPage /></MemoryRouter>)
    expect(screen.getByText('Evento Teste')).toBeInTheDocument()
  })
})
