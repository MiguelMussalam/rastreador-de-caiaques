export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export class User {
  id: string
  username: string
  password: string
  role: UserRole
  active: boolean
  createdAt: Date
  updatedAt: Date
}