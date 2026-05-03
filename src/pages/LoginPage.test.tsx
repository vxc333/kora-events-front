import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginPage } from './LoginPage'
import * as useAuthModule from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockLogin = vi.fn()

beforeEach(() => {
  vi.mocked(useAuthModule.useAuth).mockReturnValue({
    user: null, isLoading: false,
    login: mockLogin, loginError: null, loginPending: false,
    register: vi.fn(), registerError: null, registerPending: false,
    logout: vi.fn(),
  })
})

describe('LoginPage', () => {
  it('exibe erro de validação para e-mail inválido', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'invalido')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  })

  it('exibe erro de validação para senha vazia', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(await screen.findByText('Senha obrigatória')).toBeInTheDocument()
  })

  it('chama login com e-mail e senha corretos', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'maria@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'senha1234')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(mockLogin).toHaveBeenCalledWith(
      { email: 'maria@test.com', password: 'senha1234' },
      expect.anything()
    )
  })

  it('renderiza links para /register e /forgot-password', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: /esqueci/i })).toHaveAttribute('href', '/forgot-password')
  })
})
