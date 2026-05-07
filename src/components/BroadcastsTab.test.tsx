import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { BroadcastsTab } from './BroadcastsTab'

vi.mock('@/services/broadcasts')
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import * as broadcastsService from '@/services/broadcasts'

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

const mockBroadcasts = [
  {
    id: 'b1',
    subject: 'Lembrete do evento',
    body: 'Não esqueça de comparecer!',
    segment: 'ALL' as const,
    sentAt: '2026-05-01T10:00:00.000Z',
    recipientCount: 120,
  },
  {
    id: 'b2',
    subject: 'Atualização de local',
    body: 'O local foi alterado.',
    segment: 'CONFIRMED' as const,
    sentAt: '2026-05-02T09:00:00.000Z',
    recipientCount: 80,
  },
]

describe('BroadcastsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe o título "Nova mensagem" e botão de envio', async () => {
    vi.mocked(broadcastsService.getBroadcasts).mockResolvedValue([])
    wrap(<BroadcastsTab eventId="e1" />)
    expect(await screen.findByText('Nova mensagem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeInTheDocument()
  })

  it('exibe estado vazio no histórico quando não há mensagens', async () => {
    vi.mocked(broadcastsService.getBroadcasts).mockResolvedValue([])
    wrap(<BroadcastsTab eventId="e1" />)
    expect(await screen.findByText('Nenhuma mensagem enviada ainda.')).toBeInTheDocument()
  })

  it('renderiza histórico de broadcasts quando há mensagens', async () => {
    vi.mocked(broadcastsService.getBroadcasts).mockResolvedValue(mockBroadcasts)
    wrap(<BroadcastsTab eventId="e1" />)
    expect(await screen.findByText('Lembrete do evento')).toBeInTheDocument()
    expect(screen.getByText('Atualização de local')).toBeInTheDocument()
    expect(screen.getByText('120 destinatários')).toBeInTheDocument()
  })

  it('exibe passo de confirmação ao submeter formulário válido', async () => {
    vi.mocked(broadcastsService.getBroadcasts).mockResolvedValue([])
    wrap(<BroadcastsTab eventId="e1" />)

    await screen.findByText('Nova mensagem')

    await userEvent.type(
      screen.getByPlaceholderText('Ex: Informações importantes sobre o evento'),
      'Assunto teste',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Digite sua mensagem aqui...'),
      'Mensagem de teste com mais de 10 caracteres.',
    )
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(screen.getByText('Confirmar envio')).toBeInTheDocument()
  })
})
