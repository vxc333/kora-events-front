import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authService from '@/services/auth'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refresh_token'

function saveTokens(tokens: { access_token: string; refresh_token: string }) {
  localStorage.setItem(TOKEN_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: !!localStorage.getItem(TOKEN_KEY),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      saveTokens(data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      saveTokens(data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })

  function logout() {
    clearTokens()
    queryClient.removeQueries({ queryKey: ['me'] })
    navigate('/login')
  }

  return {
    user: user ?? null,
    isLoading,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    loginPending: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    registerPending: registerMutation.isPending,
    logout,
  }
}
