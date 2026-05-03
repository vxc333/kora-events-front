import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/lib/api'
import * as authService from './auth'
import type { AuthTokens, User } from '@/types/auth'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const mockTokens: AuthTokens = { access_token: 'at-123', refresh_token: 'rt-456' }
const mockUser: User = {
  id: '1', name: 'Maria', email: 'maria@test.com',
  phone: null, avatarUrl: null, role: 'ORGANIZER',
  isEmailVerified: false, plan: 'FREE',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => vi.clearAllMocks())

describe('authService.login', () => {
  it('chama POST /auth/login e retorna tokens', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockTokens })
    const result = await authService.login({ email: 'maria@test.com', password: 'senha1234' })
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'maria@test.com', password: 'senha1234' })
    expect(result).toEqual(mockTokens)
  })

  it('propaga erro do axios para o chamador', async () => {
    const networkError = new Error('Network Error')
    vi.mocked(api.post).mockRejectedValue(networkError)
    await expect(authService.login({ email: 'a@b.com', password: '123' })).rejects.toThrow('Network Error')
  })
})

describe('authService.register', () => {
  it('chama POST /auth/register e retorna tokens', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: mockTokens })
    const result = await authService.register({ name: 'Maria', email: 'maria@test.com', password: 'senha1234' })
    expect(api.post).toHaveBeenCalledWith('/auth/register', { name: 'Maria', email: 'maria@test.com', password: 'senha1234' })
    expect(result).toEqual(mockTokens)
  })
})

describe('authService.me', () => {
  it('chama GET /auth/me e retorna usuário', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockUser })
    const result = await authService.me()
    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(mockUser)
  })
})

describe('authService.forgotPassword', () => {
  it('chama POST /auth/forgot-password', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } })
    const result = await authService.forgotPassword({ email: 'maria@test.com' })
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'maria@test.com' })
    expect(result).toBeUndefined()
  })
})

describe('authService.resetPassword', () => {
  it('chama POST /auth/reset-password', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'ok' } })
    const result = await authService.resetPassword({ token: 'tok', newPassword: 'nova1234' })
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { token: 'tok', newPassword: 'nova1234' })
    expect(result).toBeUndefined()
  })
})
