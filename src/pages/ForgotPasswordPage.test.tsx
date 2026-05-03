import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { api } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('ForgotPasswordPage', () => {
  it('exibe erro de validação para e-mail inválido', async () => {
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'invalido')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  })

  it('exibe mensagem de sucesso após envio', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } })
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'maria@test.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    expect(await screen.findByText(/instruções/i)).toBeInTheDocument()
  })

  it('renderiza link para /login', () => {
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /voltar/i })).toHaveAttribute('href', '/login')
  })
})
