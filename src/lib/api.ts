import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios'

export function applyAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

export function handleAuthError(error: AxiosError): Promise<never> {
  if (error.response?.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }
  const data = (error.response?.data as { code?: string } | null)
  if (error.response?.status === 403 && data?.code === 'PLAN_UPGRADE_REQUIRED') {
    window.dispatchEvent(new CustomEvent('plan-upgrade-required'))
  }
  return Promise.reject(error)
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(applyAuthHeader)
api.interceptors.response.use((response) => response, handleAuthError)
