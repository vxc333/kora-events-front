import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LandingPage } from './LandingPage'

// Mock de assets de imagem
vi.mock('@/assets/kora-events-1.png', () => ({ default: 'kora-logo.png' }))
vi.mock('@/assets/hero.png', () => ({ default: 'hero.png' }))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // Mock IntersectionObserver não disponível no jsdom
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  })
})

describe('LandingPage', () => {
  it('renderiza o heading principal da hero', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    expect(screen.getByText('Organize eventos')).toBeInTheDocument()
    expect(screen.getByText('extraordinários.')).toBeInTheDocument()
  })

  it('renderiza links para /register e /login quando não há token', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    const registerLinks = screen.getAllByRole('link', { name: /criar conta/i })
    expect(registerLinks.length).toBeGreaterThan(0)
    expect(registerLinks[0]).toHaveAttribute('href', '/register')

    const loginLinks = screen.getAllByRole('link', { name: /entrar/i })
    expect(loginLinks[0]).toHaveAttribute('href', '/login')
  })

  it('renderiza o link para /dashboard quando há token', () => {
    localStorage.setItem('token', 'fake-jwt-token')
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('renderiza seção de funcionalidades', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    expect(screen.getByText('Gestão de eventos')).toBeInTheDocument()
    expect(screen.getByText('Ingressos em lotes')).toBeInTheDocument()
    expect(screen.getByText('Certificados PDF')).toBeInTheDocument()
  })

  it('renderiza seção de preços com plano Gratuito e Profissional', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>)
    expect(screen.getByText('Gratuito')).toBeInTheDocument()
    expect(screen.getByText('Profissional')).toBeInTheDocument()
    expect(screen.getByText('R$0')).toBeInTheDocument()
  })
})
