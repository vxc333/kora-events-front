import { api } from '@/lib/api'

export interface WhiteLabelConfig {
  id: string
  userId: string
  customDomain: string | null
  logoUrl: string | null
  primaryColor: string | null
  accentColor: string | null
  hidePoweredBy: boolean
}

export interface UpdateWhiteLabelInput {
  customDomain?: string
  logoUrl?: string
  primaryColor?: string
  accentColor?: string
  hidePoweredBy?: boolean
}

// GET /account/white-label
export async function getWhiteLabelConfig(): Promise<WhiteLabelConfig> {
  const res = await api.get<WhiteLabelConfig>('/account/white-label')
  return res.data
}

// PUT /account/white-label
export async function updateWhiteLabelConfig(data: UpdateWhiteLabelInput): Promise<WhiteLabelConfig> {
  const res = await api.put<WhiteLabelConfig>('/account/white-label', data)
  return res.data
}
