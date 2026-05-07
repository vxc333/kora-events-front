import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ParticipantPortalPage } from './ParticipantPortalPage'

vi.mock('@/services/participantPortal', () => ({
  portalLogin: vi.fn().mockResolvedValue({
    qrToken: 'tok123',
    participantName: 'João Silva',
    participantEmail: 'joao@test.com',
  }),
  getPortalEvents: vi.fn().mockResolvedValue([]),
  downloadPortalCertificate: vi.fn().mockResolvedValue(undefined),
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
  sessionStorage.clear()
})

describe('ParticipantPortalPage', () => {
  it('renderiza o título "Meu Portal de Eventos" no estado inicial', () => {
    render(<ParticipantPortalPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Meu Portal de Eventos')).toBeInTheDocument()
  })

  it('exibe o campo de CPF', () => {
    render(<ParticipantPortalPage />, { wrapper: makeWrapper() })
    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument()
  })

  it('exibe o campo de e-mail', () => {
    render(<ParticipantPortalPage />, { wrapper: makeWrapper() })
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
  })

  it('exibe o botão de Entrar desabilitado inicialmente', () => {
    render(<ParticipantPortalPage />, { wrapper: makeWrapper() })
    expect(screen.getByRole('button', { name: /entrar/i })).toBeDisabled()
  })

  it('renderiza a mensagem sobre acesso sem senha', () => {
    render(<ParticipantPortalPage />, { wrapper: makeWrapper() })
    expect(screen.getByText(/não é necessário senha/i)).toBeInTheDocument()
  })
})
