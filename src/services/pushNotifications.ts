import { api } from '@/lib/api'

export interface PushToken {
  id: string
  fcmToken: string
  qrToken: string | null
  userId: string | null
  createdAt: string
}

export async function registerPushToken(
  fcmToken: string,
  options?: { qrToken?: string; userId?: string },
): Promise<PushToken> {
  const res = await api.post<PushToken>('/push-tokens', {
    fcmToken,
    ...options,
  })
  return res.data
}
