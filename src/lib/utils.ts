import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a relative upload path (e.g. "/uploads/events/abc.jpg") into
 * an absolute URL pointing to the backend server.
 * Already-absolute URLs (http/https) are returned unchanged.
 */
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/v\d+\/?$/, '') ?? ''
  return `${base}${path}`
}
