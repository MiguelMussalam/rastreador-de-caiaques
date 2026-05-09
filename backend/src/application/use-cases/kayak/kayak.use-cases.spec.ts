import { BadRequestException, NotFoundException } from '@nestjs/common'
import {
  DeleteKayakUseCase,
  GetKayakUseCase,
  RegisterKayakUseCase,
  UpdateKayakUseCase,
} from './kayak.use-cases'
import { IKayakRepository } from '../../../domain/repositories/kayak.repository'
import { Kayak, KayakStatus } from '../../../domain/entities/kayak.entity'
import { CreateKayakDto, KayakResponseDto, UpdateKayakDto } from '../../dtos/kayak.dto'

const makeKayak = (overrides: Partial<Kayak> = {}): Kayak => ({
  id: 'uuid-1',
  code: 'KYK-001',
  name: 'Caiaque Alpha',
  status: KayakStatus.AVAILABLE,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeMockRepo = (): jest.Mocked<IKayakRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByCode: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsByCode: jest.fn(),
})

describe('RegisterKayakUseCase', () => {
  it('deve registrar caiaque quando código não existe', async () => {
    const repo = makeMockRepo()
    const useCase = new RegisterKayakUseCase(repo)
    const kayak = makeKayak()

    repo.existsByCode.mockResolvedValue(false)
    repo.create.mockResolvedValue(kayak)

    const result = await useCase.execute({ code: 'KYK-001', name: 'Caiaque Alpha' })

    expect(result.code).toBe('KYK-001')
    expect(repo.create).toHaveBeenCalledTimes(1)
  })

  it('deve lançar BadRequestException quando código já existe', async () => {
    const repo = makeMockRepo()
    const useCase = new RegisterKayakUseCase(repo)

    repo.existsByCode.mockResolvedValue(true)

    await expect(
      useCase.execute({ code: 'KYK-001', name: 'Caiaque Alpha' }),
    ).rejects.toThrow(BadRequestException)
    expect(repo.create).not.toHaveBeenCalled()
  })
})

describe('GetKayakUseCase', () => {
  it('deve retornar caiaque por id', async () => {
    const repo = makeMockRepo()
    const useCase = new GetKayakUseCase(repo)

    repo.findById.mockResolvedValue(makeKayak({ id: 'uuid-1' }))

    const result = await useCase.findById('uuid-1')
    expect(result.id).toBe('uuid-1')
  })

  it('deve lançar NotFoundException quando caiaque não encontrado', async () => {
    const repo = makeMockRepo()
    const useCase = new GetKayakUseCase(repo)

    repo.findById.mockResolvedValue(null)

    await expect(useCase.findById('uuid-x')).rejects.toThrow(NotFoundException)
  })

  it('deve filtrar caiaques por status', async () => {
    const repo = makeMockRepo()
    const useCase = new GetKayakUseCase(repo)

    repo.findByStatus.mockResolvedValue([
      makeKayak({ status: KayakStatus.IN_USE }),
      makeKayak({ id: 'uuid-2', code: 'KYK-002', status: KayakStatus.IN_USE }),
    ])

    const result = await useCase.findByStatus(KayakStatus.IN_USE)
    expect(result).toHaveLength(2)
    expect(result.every((k: KayakResponseDto) => k.status === KayakStatus.IN_USE)).toBe(true)
  })
})

describe('UpdateKayakUseCase', () => {
  it('deve atualizar status do caiaque', async () => {
    const repo = makeMockRepo()
    const useCase = new UpdateKayakUseCase(repo)
    const updated = makeKayak({ status: KayakStatus.IN_USE })

    repo.findById.mockResolvedValue(makeKayak())
    repo.update.mockResolvedValue(updated)

    const result = await useCase.execute('uuid-1', { status: KayakStatus.IN_USE })
    expect(result.status).toBe(KayakStatus.IN_USE)
  })
})

describe('DeleteKayakUseCase', () => {
  it('deve deletar caiaque existente', async () => {
    const repo = makeMockRepo()
    const useCase = new DeleteKayakUseCase(repo)

    repo.findById.mockResolvedValue(makeKayak())
    repo.delete.mockResolvedValue(undefined)

    await useCase.execute('uuid-1')
    expect(repo.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('deve lançar NotFoundException ao deletar caiaque inexistente', async () => {
    const repo = makeMockRepo()
    const useCase = new DeleteKayakUseCase(repo)

    repo.findById.mockResolvedValue(null)

    await expect(useCase.execute('uuid-x')).rejects.toThrow(NotFoundException)
    expect(repo.delete).not.toHaveBeenCalled()
  })
})