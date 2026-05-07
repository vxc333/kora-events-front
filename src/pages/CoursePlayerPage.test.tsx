import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { CoursePlayerPage } from './CoursePlayerPage'

vi.mock('@/services/courses', () => ({
  getCourse: vi.fn().mockResolvedValue(null),
  completeModule: vi.fn().mockResolvedValue({}),
  getModuleQuiz: vi.fn().mockResolvedValue([]),
  submitQuiz: vi.fn().mockResolvedValue({ correct: 3, total: 3, passed: true }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/cursos/mock']}>
        <Routes>
          <Route path="/cursos/:id" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CoursePlayerPage', () => {
  it('renderiza o título do curso mockado', () => {
    render(<CoursePlayerPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Introdução à Organização de Eventos')).toBeInTheDocument()
  })

  it('renderiza a lista de módulos na sidebar', () => {
    render(<CoursePlayerPage />, { wrapper: makeWrapper() })
    // The first module title appears in sidebar + content area — use getAllByText
    expect(screen.getAllByText('Introdução ao planejamento de eventos').length).toBeGreaterThan(0)
    expect(screen.getByText('Definindo público e objetivos')).toBeInTheDocument()
    expect(screen.getByText('Orçamento e fornecedores')).toBeInTheDocument()
  })

  it('exibe o label "Progresso" na sidebar', () => {
    render(<CoursePlayerPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Progresso')).toBeInTheDocument()
  })

  it('renderiza o botão "Marcar como concluído" para o módulo ativo', () => {
    render(<CoursePlayerPage />, { wrapper: makeWrapper() })
    const buttons = screen.getAllByRole('button', { name: /marcar como concluído/i })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('exibe a seção de quiz do módulo', () => {
    render(<CoursePlayerPage />, { wrapper: makeWrapper() })
    expect(screen.getByText('Quiz do módulo')).toBeInTheDocument()
  })
})
