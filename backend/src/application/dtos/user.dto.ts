import type { UserRole } from '../../domain/entities/user.entity'

export class CreateUserDto {
  username: string
  password: string
  role?: UserRole
}

export class UpdateUserDto {
  password?: string
  role?: UserRole
  active?: boolean
}

export class UserResponseDto {
  id: string
  username: string
  role: UserRole
  active: boolean
  createdAt: Date
  updatedAt: Date
}