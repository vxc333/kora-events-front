import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlanUpgradeModal } from './PlanUpgradeModal'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { plan: 'FREE' } }),
}))

describe('PlanUpgradeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não renderiza o modal por padrão', () => {
    render(<PlanUpgradeModal />)
    expect(screen.queryByText('Faça upgrade do seu plano')).not.toBeInTheDocument()
  })

  it('renderiza o modal quando evento plan-upgrade-required é disparado', () => {
    render(<PlanUpgradeModal />)
    act(() => {
      window.dispatchEvent(new Event('plan-upgrade-required'))
    })
    expect(screen.getByText('Faça upgrade do seu plano')).toBeInTheDocument()
  })

  it('exibe texto "Faça upgrade" quando modal está aberto', () => {
    render(<PlanUpgradeModal />)
    act(() => {
      window.dispatchEvent(new Event('plan-upgrade-required'))
    })
    expect(screen.getByText('Faça upgrade do seu plano')).toBeInTheDocument()
    expect(screen.getByText('Plano Free')).toBeInTheDocument()
  })

  it('fecha o modal ao clicar no botão X', async () => {
    render(<PlanUpgradeModal />)
    act(() => {
      window.dispatchEvent(new Event('plan-upgrade-required'))
    })
    expect(screen.getByText('Faça upgrade do seu plano')).toBeInTheDocument()

    const closeBtn = screen.getByRole('button')
    await userEvent.click(closeBtn)

    expect(screen.queryByText('Faça upgrade do seu plano')).not.toBeInTheDocument()
  })
})
