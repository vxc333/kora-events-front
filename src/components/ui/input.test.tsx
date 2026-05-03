import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('renders with label associado', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('exibe mensagem de erro', () => {
    render(<Input label="Email" error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('está desabilitado quando disabled prop é passada', () => {
    render(<Input label="Email" disabled />)
    expect(screen.getByLabelText('Email')).toBeDisabled()
  })

  it('renderiza sem label', () => {
    render(<Input placeholder="Buscar..." />)
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })
})
