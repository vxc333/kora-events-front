import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppShell } from './AppShell'
import * as useAuthModule from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockLogout = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAuthModule.useAuth).mockReturnValue({
    user: {
      id: '1', name: 'Maria Silva', email: 'maria@test.com',
      phone: null, avatarUrl: null, role: 'ORGANIZER',
      isEmailVerified: false, plan: 'FREE',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    isLoading: false,
    login: vi.fn(), loginError: null, loginPending: false,
    register: vi.fn(), registerError: null, registerPending: false,
    logout: mockLogout,
  })
})

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<div>Conteúdo do Dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('AppShell', () => {
  it('renderiza link Eventos apontando para /dashboard', () => {
    renderShell()
    expect(screen.getByRole('link', { name: /eventos/i })).toHaveAttribute('href', '/dashboard')
  })

  it('renderiza nome e email do usuário', () => {
    renderShell()
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('maria@test.com')).toBeInTheDocument()
  })

  it('chama logout ao clicar em Sair', async () => {
    renderShell()
    await userEvent.click(screen.getByRole('button', { name: /sair/i }))
    expect(mockLogout).toHaveBeenCalledOnce()
  })

  it('renderiza conteúdo filho via Outlet', () => {
    renderShell()
    expect(screen.getByText('Conteúdo do Dashboard')).toBeInTheDocument()
  })
})
