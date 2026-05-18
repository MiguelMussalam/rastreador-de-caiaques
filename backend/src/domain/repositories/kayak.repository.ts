import type { Kayak, KayakStatus } from '../entities/kayak.entity'

export interface IKayakRepository {
  create(data: Omit<Kayak, 'id' | 'createdAt' | 'updatedAt'>): Promise<Kayak>
  findById(id: string): Promise<Kayak | null>
  findByDeviceId(deviceId: number): Promise<Kayak | null>
  findAll(): Promise<Kayak[]>
  findByStatus(status: KayakStatus): Promise<Kayak[]>
  existsByCode(code: string): Promise<boolean>
  update(id: string, data: Partial<Omit<Kayak, 'id' | 'code' | 'createdAt' | 'updatedAt'>>): Promise<Kayak>
  delete(id: string): Promise<void>
}

export const KAYAK_REPOSITORY = Symbol('IKayakRepository')