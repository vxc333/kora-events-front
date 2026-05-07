import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { MembersTab } from './MembersTab'

vi.mock('@/services/members')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import * as membersService from '@/services/members'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

const mockMembers = [
  {
    id: 'm1',
    eventId: 'e1',
    userId: 'u1',
    role: 'ADMIN' as const,
    user: { id: 'u1', name: 'João Silva', email: 'joao@example.com' },
  },
  {
    id: 'm2',
    eventId: 'e1',
    userId: 'u2',
    role: 'CHECKIN' as const,
    user: { id: 'u2', name: 'Maria Santos', email: 'maria@example.com' },
  },
]

describe('MembersTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe estado vazio quando não há membros', async () => {
    vi.mocked(membersService.getMembers).mockResolvedValue([])
    wrap(<MembersTab eventId="e1" />)
    expect(await screen.findByText('Nenhum membro adicionado.')).toBeInTheDocument()
  })

  it('renderiza nome e badge de papel dos membros', async () => {
    vi.mocked(membersService.getMembers).mockResolvedValue(mockMembers)
    wrap(<MembersTab eventId="e1" />)
    expect(await screen.findByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    // Both names appear — check at least one element with each role label exists
    expect(screen.getAllByText('Administrador').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Check-in').length).toBeGreaterThanOrEqual(1)
  })

  it('exibe formulário de convite ao clicar em "Adicionar membro"', async () => {
    vi.mocked(membersService.getMembers).mockResolvedValue([])
    wrap(<MembersTab eventId="e1" />)
    const addBtn = await screen.findByRole('button', { name: /adicionar membro/i })
    await userEvent.click(addBtn)
    expect(screen.getByText('Convidar membro')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('E-mail do usuário')).toBeInTheDocument()
  })
})
