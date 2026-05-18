import type { User } from '../entities/user.entity'

export interface IUserRepository {
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  findById(id: string): Promise<User | null>
  findAll(): Promise<User[]>
  existsByUsername(username: string): Promise<boolean>
  update(id: string, data: Partial<Omit<User, 'id' | 'username' | 'createdAt' | 'updatedAt'>>): Promise<User>
  delete(id: string): Promise<void>
}

export const USER_REPOSITORY = Symbol('IUserRepository')