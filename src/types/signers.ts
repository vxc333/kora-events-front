export interface CertificateSigner {
  id: string
  eventId: string
  name: string
  title: string
  signatureUrl: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateSignerInput {
  name: string
  title: string
  displayOrder?: number
}

export type UpdateSignerInput = Partial<CreateSignerInput>
