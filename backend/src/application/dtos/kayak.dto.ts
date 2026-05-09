import type { KayakStatus } from '../../domain/entities/kayak.entity'

export class CreateKayakDto {
  code: string
  name: string
}

export class UpdateKayakDto {
  name?: string
  status?: KayakStatus
  active?: boolean
}

export class KayakResponseDto {
  id: string
  code: string
  name: string
  status: KayakStatus
  active: boolean
  createdAt: Date
  updatedAt: Date
}