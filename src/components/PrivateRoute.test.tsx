import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { PrivateRoute } from './PrivateRoute'
import * as useAuthModule from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockUseAuth = (overrides: Partial<ReturnType<typeof useAuthModule.useAuth>>) => {
  vi.mocked(useAuthModule.useAuth).mockReturnValue({
    user: null,
    isLoading: false,
    login: vi.fn(),
    loginError: null,
    loginPending: false,
    register: vi.fn(),
    registerError: null,
    registerPending: false,
    logout: vi.fn(),
    ...overrides,
  })
}

describe('PrivateRoute', () => {
  it('redireciona para /login quando usuário não está autenticado', () => {
    mockUseAuth({ user: null, isLoading: false })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Página de Login</div>} />
          <Route
            path="/dashboard"
            element={<PrivateRoute><div>Dashboard</div></PrivateRoute>}
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('renderiza filhos quando usuário está autenticado', () => {
    mockUseAuth({
      user: {
        id: '1', name: 'Maria', email: 'maria@test.com',
        phone: null, avatarUrl: null, role: 'ORGANIZER',
        isEmailVerified: false, plan: 'FREE',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
      },
      isLoading: false,
    })
    render(
      <MemoryRouter>
        <PrivateRoute><div>Dashboard</div></PrivateRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('exibe spinner enquanto carregando', () => {
    mockUseAuth({ user: null, isLoading: true })
    render(
      <MemoryRouter>
        <PrivateRoute><div>Dashboard</div></PrivateRoute>
      </MemoryRouter>
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })
})
