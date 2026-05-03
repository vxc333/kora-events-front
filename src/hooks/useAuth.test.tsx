import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import * as authService from '@/services/auth'
import type { User } from '@/types/auth'

vi.mock('@/services/auth')

const mockUser: User = {
  id: '1', name: 'Maria', email: 'maria@test.com',
  phone: null, avatarUrl: null, role: 'ORGANIZER',
  isEmailVerified: false, plan: 'FREE',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
}

let queryClient: QueryClient

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('retorna user null e isLoading false quando não há token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('salva tokens no localStorage após login bem-sucedido', async () => {
    vi.mocked(authService.login).mockResolvedValue({ access_token: 'at', refresh_token: 'rt' })
    vi.mocked(authService.me).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      result.current.login({ email: 'maria@test.com', password: 'senha1234' })
    })

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('at')
      expect(localStorage.getItem('refresh_token')).toBe('rt')
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('limpa tokens do localStorage no logout', () => {
    localStorage.setItem('token', 'at')
    localStorage.setItem('refresh_token', 'rt')

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })
})
