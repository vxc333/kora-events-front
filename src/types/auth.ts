export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  role: 'ADMIN' | 'ORGANIZER'
  isEmailVerified: boolean
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  createdAt: string
  updatedAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  phone?: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}
