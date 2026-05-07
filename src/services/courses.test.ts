import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import { getCourse, completeModule, getModuleQuiz, submitQuiz } from './courses'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockModule = {
  id: 'mod-1',
  title: 'Introdução',
  videoUrl: null,
  duration: 30,
  order: 1,
  completedAt: null,
}

const mockCourse = {
  id: 'crs-1',
  title: 'Curso de TypeScript',
  description: 'Aprenda TypeScript do zero.',
  coverUrl: null,
  totalDuration: 120,
  minimumCompletion: 80,
  modules: [mockModule],
  enrolledAt: '2026-05-01T00:00:00.000Z',
  certificateAvailable: false,
}

const mockQuiz = [
  { id: 'q-1', question: 'O que é TypeScript?', options: ['A', 'B', 'C'], correctIndex: 0 },
]

const mockQuizResult = { correct: 1, total: 1, passed: true }

beforeEach(() => vi.clearAllMocks())

describe('getCourse', () => {
  it('chama GET /courses/:id e retorna o curso', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockCourse })
    const result = await getCourse('crs-1')
    expect(api.get).toHaveBeenCalledWith('/courses/crs-1')
    expect(result).toEqual(mockCourse)
  })
})

describe('completeModule', () => {
  it('chama POST /courses/:id/modules/:mid/complete e retorna módulo', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...mockModule, completedAt: '2026-05-02T00:00:00.000Z' } })
    const result = await completeModule('crs-1', 'mod-1')
    expect(api.post).toHaveBeenCalledWith('/courses/crs-1/modules/mod-1/complete')
    expect(result.completedAt).toBeTruthy()
  })
})

describe('getModuleQuiz', () => {
  it('chama GET /courses/:id/modules/:mid/quiz e retorna perguntas', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockQuiz })
    const result = await getModuleQuiz('crs-1', 'mod-1')
    expect(api.get).toHaveBeenCalledWith('/courses/crs-1/modules/mod-1/quiz')
    expect(result).toEqual(mockQuiz)
  })
})

describe('submitQuiz', () => {
  it('chama POST /courses/:id/modules/:mid/quiz com respostas e retorna resultado', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockQuizResult })
    const result = await submitQuiz('crs-1', 'mod-1', [0])
    expect(api.post).toHaveBeenCalledWith('/courses/crs-1/modules/mod-1/quiz', { answers: [0] })
    expect(result).toEqual(mockQuizResult)
  })
})
