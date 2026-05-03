import { describe, it, expect, beforeEach } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'

import { applyAuthHeader, handleAuthError } from './api'

describe('applyAuthHeader', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('injeta Authorization quando token existe no localStorage', () => {
    localStorage.setItem('token', 'abc123')
    const config = { headers: {} } as InternalAxiosRequestConfig
    const result = applyAuthHeader(config)
    expect(result.headers.Authorization).toBe('Bearer abc123')
  })

  it('não adiciona Authorization quando token ausente', () => {
    const config = { headers: {} } as InternalAxiosRequestConfig
    const result = applyAuthHeader(config)
    expect(result.headers.Authorization).toBeUndefined()
  })
})

describe('handleAuthError', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
      configurable: true,
    })
  })

  it('remove token e redireciona para /login em 401', async () => {
    localStorage.setItem('token', 'abc123')
    const error = { response: { status: 401 } }
    await expect(handleAuthError(error as never)).rejects.toEqual(error)
    expect(localStorage.getItem('token')).toBeNull()
    expect(window.location.href).toBe('/login')
  })

  it('rejeita o erro sem alterar localStorage para outros status', async () => {
    localStorage.setItem('token', 'abc123')
    const error = { response: { status: 403 } }
    await expect(handleAuthError(error as never)).rejects.toEqual(error)
    expect(localStorage.getItem('token')).toBe('abc123')
  })
})
