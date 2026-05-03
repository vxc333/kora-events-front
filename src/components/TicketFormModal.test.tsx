import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketFormModal } from './TicketFormModal'
import type { Ticket } from '@/types/tickets'

const mockOnSubmit = vi.fn()
const mockOnClose = vi.fn()

const mockTicket: Ticket = {
  id: 'ticket-1',
  name: 'Ingresso VIP',
  description: 'Acesso especial',
  price: 0,
  currency: 'BRL',
  quantity: 50,
  quantitySold: 0,
  isActive: true,
  salesStartDate: null,
  salesEndDate: null,
  isHalfPrice: true,
  discountCode: null,
  discountPercentage: null,
  eventId: 'event-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => vi.clearAllMocks())

describe('TicketFormModal', () => {
  it('renderiza modal de criação quando open=true e ticket=undefined', () => {
    render(
      <TicketFormModal open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isPending={false} />
    )
    expect(screen.getByRole('heading', { name: /novo ingresso/i })).toBeInTheDocument()
  })

  it('renderiza modal de edição quando ticket é fornecido', () => {
    render(
      <TicketFormModal open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isPending={false} ticket={mockTicket} />
    )
    expect(screen.getByRole('heading', { name: /editar ingresso/i })).toBeInTheDocument()
  })

  it('pré-preenche formulário com dados do ticket em modo edição', () => {
    render(
      <TicketFormModal open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isPending={false} ticket={mockTicket} />
    )
    expect(screen.getByLabelText(/nome/i)).toHaveValue('Ingresso VIP')
    expect(screen.getByLabelText(/quantidade/i)).toHaveValue(50)
  })

  it('exibe erro de validação para nome vazio', async () => {
    render(
      <TicketFormModal open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isPending={false} />
    )
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(await screen.findByText('Nome obrigatório')).toBeInTheDocument()
  })

  it('chama onSubmit com dados corretos ao salvar', async () => {
    render(
      <TicketFormModal open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isPending={false} />
    )
    await userEvent.type(screen.getByLabelText(/nome/i), 'Ingresso Geral')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(screen.queryByText('Nome obrigatório')).not.toBeInTheDocument()
  })

  it('chama onClose ao clicar em Cancelar', async () => {
    render(
      <TicketFormModal open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isPending={false} />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('não renderiza quando open=false', () => {
    render(
      <TicketFormModal open={false} onClose={mockOnClose} onSubmit={mockOnSubmit} isPending={false} />
    )
    expect(screen.queryByRole('heading', { name: /ingresso/i })).not.toBeInTheDocument()
  })
})
