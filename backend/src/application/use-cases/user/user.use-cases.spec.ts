import { BadRequestException, NotFoundException } from '@nestjs/common'
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
} from './user.use-cases'
import { IUserRepository } from '../../../domain/repositories/user.repository'
import { User } from '../../../domain/entities/user.entity'

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'uuid-1',
  username: 'operador01',
  password: 'senha123',
  role: 'OPERATOR' as any,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeMockRepo = (): jest.Mocked<IUserRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsByUsername: jest.fn(),
})

describe('CreateUserUseCase', () => {
  it('deve criar usuário quando username não existe', async () => {
    const repo = makeMockRepo()
    const useCase = new CreateUserUseCase(repo)
    const user = makeUser()

    repo.existsByUsername.mockResolvedValue(false)
    repo.create.mockResolvedValue(user)

    const result = await useCase.execute({ username: 'operador01', password: 'senha123' })

    expect(result.username).toBe('operador01')
    expect(repo.create).toHaveBeenCalledTimes(1)
  })

  it('deve lançar BadRequestException quando username já existe', async () => {
    const repo = makeMockRepo()
    const useCase = new CreateUserUseCase(repo)

    repo.existsByUsername.mockResolvedValue(true)

    await expect(
      useCase.execute({ username: 'operador01', password: 'senha123' }),
    ).rejects.toThrow(BadRequestException)
    expect(repo.create).not.toHaveBeenCalled()
  })
})

describe('GetUserUseCase', () => {
  it('deve retornar usuário por id', async () => {
    const repo = makeMockRepo()
    const useCase = new GetUserUseCase(repo)
    const user = makeUser({ id: 'uuid-1' })

    repo.findById.mockResolvedValue(user)

    const result = await useCase.findById('uuid-1')
    expect(result.id).toBe('uuid-1')
  })

  it('deve lançar NotFoundException quando usuário não encontrado', async () => {
    const repo = makeMockRepo()
    const useCase = new GetUserUseCase(repo)

    repo.findById.mockResolvedValue(null)

    await expect(useCase.findById('uuid-inexistente')).rejects.toThrow(NotFoundException)
  })

  it('deve retornar lista de usuários', async () => {
    const repo = makeMockRepo()
    const useCase = new GetUserUseCase(repo)

    repo.findAll.mockResolvedValue([makeUser(), makeUser({ id: 'uuid-2', username: 'u2' })])

    const result = await useCase.findAll()
    expect(result).toHaveLength(2)
  })
})

describe('UpdateUserUseCase', () => {
  it('deve atualizar role do usuário', async () => {
    const repo = makeMockRepo()
    const useCase = new UpdateUserUseCase(repo)
    const updated = makeUser({ role: 'ADMIN' as any })

    repo.findById.mockResolvedValue(makeUser())
    repo.update.mockResolvedValue(updated)

    const result = await useCase.execute('uuid-1', { role: 'ADMIN' as any })
    expect(result.role).toBe('ADMIN')
  })

  it('deve lançar NotFoundException ao atualizar usuário inexistente', async () => {
    const repo = makeMockRepo()
    const useCase = new UpdateUserUseCase(repo)

    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('uuid-x', { role: 'ADMIN' as any })).rejects.toThrow(NotFoundException)
  })
})

describe('DeleteUserUseCase', () => {
  it('deve deletar usuário existente', async () => {
    const repo = makeMockRepo()
    const useCase = new DeleteUserUseCase(repo)

    repo.findById.mockResolvedValue(makeUser())
    repo.delete.mockResolvedValue(undefined)

    await useCase.execute('uuid-1')
    expect(repo.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('deve lançar NotFoundException ao deletar usuário inexistente', async () => {
    const repo = makeMockRepo()
    const useCase = new DeleteUserUseCase(repo)

    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('uuid-x')).rejects.toThrow(NotFoundException)
    expect(repo.delete).not.toHaveBeenCalled()
  })
})