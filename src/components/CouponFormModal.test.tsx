import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CouponFormModal } from './CouponFormModal'
import type { Coupon } from '@/types/coupons'

const defaultProps = {
  open: true,
  isPending: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
}

const mockCoupon: Coupon = {
  id: 'c1',
  code: 'KORA10',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  maxUses: 100,
  usedCount: 5,
  expiresAt: '2026-12-31T00:00:00.000Z',
  isActive: true,
  eventId: 'e1',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('CouponFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não renderiza quando open é false', () => {
    render(<CouponFormModal {...defaultProps} open={false} />)
    expect(screen.queryByText('Novo cupom')).not.toBeInTheDocument()
    expect(screen.queryByText('Editar cupom')).not.toBeInTheDocument()
  })

  it('renderiza título "Novo cupom" quando nenhum cupom é passado', () => {
    render(<CouponFormModal {...defaultProps} />)
    expect(screen.getByText('Novo cupom')).toBeInTheDocument()
  })

  it('renderiza título "Editar cupom" quando um cupom é fornecido', () => {
    render(<CouponFormModal {...defaultProps} coupon={mockCoupon} />)
    expect(screen.getByText('Editar cupom')).toBeInTheDocument()
  })

  it('cancelar chama callback onClose', async () => {
    render(<CouponFormModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('submeter formulário chama callback onSubmit com os dados', async () => {
    render(<CouponFormModal {...defaultProps} />)

    await userEvent.type(screen.getByPlaceholderText('EX: KORA10'), 'TESTE20')
    await userEvent.clear(screen.getByLabelText(/desconto/i))
    await userEvent.type(screen.getByLabelText(/desconto/i), '20')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TESTE20', discountValue: 20 }),
    )
  })
})
