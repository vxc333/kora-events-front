import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterPage } from './RegisterPage'
import * as useAuthModule from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockRegister = vi.fn()

beforeEach(() => {
  vi.mocked(useAuthModule.useAuth).mockReturnValue({
    user: null, isLoading: false,
    login: vi.fn(), loginError: null, loginPending: false,
    register: mockRegister, registerError: null, registerPending: false,
    logout: vi.fn(),
  })
})

describe('RegisterPage', () => {
  it('exibe erro para e-mail inválido', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'invalido')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  })

  it('exibe erro para senha com menos de 8 caracteres', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/senha/i), '1234567')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(await screen.findByText('Mínimo 8 caracteres')).toBeInTheDocument()
  })

  it('chama register com dados corretos', async () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/nome/i), 'Maria Silva')
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'maria@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'senha1234')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(mockRegister).toHaveBeenCalledWith(
      { name: 'Maria Silva', email: 'maria@test.com', password: 'senha1234' },
      expect.anything()
    )
  })

  it('renderiza link para /login', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /já tenho conta/i })).toHaveAttribute('href', '/login')
  })
})
