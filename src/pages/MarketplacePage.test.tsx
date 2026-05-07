import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MarketplacePage } from './MarketplacePage'

vi.mock('@/services/marketplace', () => ({
  getMarketplaceEvents: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}))

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MarketplacePage', () => {
  it('renderiza o heading Descubra eventos', () => {
    render(<MarketplacePage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Descubra eventos')).toBeInTheDocument()
  })

  it('renderiza os pills de categoria', () => {
    render(<MarketplacePage />, { wrapper: makeWrapper() })
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tecnologia' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Educação' })).toBeInTheDocument()
  })

  it('renderiza o campo de busca', () => {
    render(<MarketplacePage />, { wrapper: makeWrapper() })
    expect(screen.getByPlaceholderText(/buscar por nome/i)).toBeInTheDocument()
  })

  it('exibe seção "Em destaque" com eventos mockados quando sem filtros', () => {
    render(<MarketplacePage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Em destaque')).toBeInTheDocument()
    expect(screen.getByText('Summit Tech 2026')).toBeInTheDocument()
  })

  it('exibe estado vazio quando a API retorna zero eventos', async () => {
    render(<MarketplacePage />, { wrapper: makeWrapper() })
    // Heading always present; after query resolves empty, "Em breve por aqui" appears
    expect(await screen.findByText('Em breve por aqui')).toBeInTheDocument()
  })
})
