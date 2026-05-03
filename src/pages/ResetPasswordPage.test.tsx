import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ResetPasswordPage } from './ResetPasswordPage'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

function renderWithToken(token = 'tok123') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <Routes>
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ResetPasswordPage', () => {
  it('exibe erro para senha com menos de 8 caracteres', async () => {
    renderWithToken()
    await userEvent.type(screen.getByLabelText(/nova senha/i), '1234567')
    await userEvent.click(screen.getByRole('button', { name: /redefinir/i }))
    expect(await screen.findByText('Mínimo 8 caracteres')).toBeInTheDocument()
  })

  it('chama resetPassword com token da URL e nova senha', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } })
    renderWithToken('meu-token')
    await userEvent.type(screen.getByLabelText(/nova senha/i), 'novasenha123')
    await userEvent.click(screen.getByRole('button', { name: /redefinir/i }))
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'meu-token',
      newPassword: 'novasenha123',
    })
  })

  it('redireciona para /login após sucesso', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } })
    renderWithToken()
    await userEvent.type(screen.getByLabelText(/nova senha/i), 'novasenha123')
    await userEvent.click(screen.getByRole('button', { name: /redefinir/i }))
    expect(await screen.findByText('Login')).toBeInTheDocument()
  })
})
