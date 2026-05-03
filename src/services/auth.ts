import { api } from '@/lib/api'
import type { AuthTokens, LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, User } from '@/types/auth'

export async function login(data: LoginInput): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>('/auth/login', data)
  return res.data
}

export async function register(data: RegisterInput): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>('/auth/register', data)
  return res.data
}

export async function me(): Promise<User> {
  const res = await api.get<User>('/auth/me')
  return res.data
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<void> {
  await api.post('/auth/forgot-password', data)
}

export async function resetPassword(data: ResetPasswordInput): Promise<void> {
  await api.post('/auth/reset-password', data)
}
