import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WhiteLabelSettingsPage } from './WhiteLabelSettingsPage'
import * as useAuthModule from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/whiteLabelAccount', () => ({
  getWhiteLabelConfig: vi.fn().mockResolvedValue({
    customDomain: '',
    logoUrl: '',
    primaryColor: '#5B21B6',
    accentColor: '#7C3AED',
    hidePoweredBy: false,
  }),
  updateWhiteLabelConfig: vi.fn().mockResolvedValue({}),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

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

describe('WhiteLabelSettingsPage', () => {
  it('renderiza o título White-label', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: { plan: 'FREE', id: '1', email: 'test@test.com', name: 'Test' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuthModule.useAuth>)
    render(<WhiteLabelSettingsPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('White-label')).toBeInTheDocument()
  })

  it('exibe aviso de plano Enterprise quando usuário não é Enterprise', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: { plan: 'FREE', id: '1', email: 'test@test.com', name: 'Test' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuthModule.useAuth>)
    render(<WhiteLabelSettingsPage />, { wrapper: makeWrapper() })
    expect(screen.getByText(/plano Enterprise/i)).toBeInTheDocument()
  })

  it('renderiza o botão Salvar alterações', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: { plan: 'ENTERPRISE', id: '1', email: 'test@test.com', name: 'Test' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuthModule.useAuth>)
    render(<WhiteLabelSettingsPage />, { wrapper: makeWrapper() })
    expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
  })

  it('renderiza campos de configuração', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: { plan: 'ENTERPRISE', id: '1', email: 'test@test.com', name: 'Test' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as ReturnType<typeof useAuthModule.useAuth>)
    render(<WhiteLabelSettingsPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Identidade visual')).toBeInTheDocument()
    expect(screen.getByText('Domínio personalizado')).toBeInTheDocument()
    expect(screen.getByText('Logo')).toBeInTheDocument()
  })
})
