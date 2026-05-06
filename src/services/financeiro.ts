import { api } from '@/lib/api'

export interface ExtratoEvento {
  eventId: string
  eventTitle: string
  eventDate: string
  eventStatus: string
  ingressosVendidos: number
  ingressosPagos: number
  receitaBruta: number
  taxaPlataforma: number
  valorRepassar: number
}

export interface FinanceiroSummary {
  receitaBruta: number
  taxaPlataforma: number
  valorRepassar: number
  totalIngressosPagos: number
  totalEventos: number
  extrato: ExtratoEvento[]
}

export async function getFinancialSummary(): Promise<FinanceiroSummary> {
  const res = await api.get<FinanceiroSummary>('/financeiro')
  return res.data
}
