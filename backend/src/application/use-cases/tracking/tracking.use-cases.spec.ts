import { NotFoundException } from '@nestjs/common'
import {
  GetTrackingUseCase,
  IngestTrackingPointUseCase,
} from './tracking.use-cases'
import { ITrackingPointRepository } from '../../../domain/repositories/tracking-point.repository'
import { IKayakRepository } from '../../../domain/repositories/kayak.repository'
import { TrackingPoint } from '../../../domain/entities/tracking-point.entity'
import type { Kayak } from '../../../domain/entities/kayak.entity'
import { KayakStatus } from '../../../domain/entities/kayak.entity'

const makeKayak = (overrides: Partial<Kayak> = {}): Kayak => ({
  id: 'uuid-kayak-1',
  code: 'KYK-001',
  name: 'Caiaque Alpha',
  status: KayakStatus.AVAILABLE,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makePoint = (overrides: Partial<TrackingPoint> = {}): TrackingPoint => ({
  id: 'uuid-point-1',
  kayakId: 'uuid-kayak-1',
  latitude: -23.9618,
  longitude: -46.3322,
  speedKmh: 4.5,
  batteryLevel: 87,
  recordedAt: new Date(),
  ...overrides,
})

const makeMockTrackingRepo = (): jest.Mocked<ITrackingPointRepository> => ({
  create: jest.fn(),
  findLatestByKayakId: jest.fn(),
  findByKayakId: jest.fn(),
  findByKayakIdAndDateRange: jest.fn(),
  deleteByKayakId: jest.fn(),
})

const makeMockKayakRepo = (): jest.Mocked<IKayakRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByCode: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsByCode: jest.fn(),
})

describe('IngestTrackingPointUseCase', () => {
  it('deve salvar ponto de rastreamento quando caiaque existe', async () => {
    const trackingRepo = makeMockTrackingRepo()
    const kayakRepo = makeMockKayakRepo()
    const useCase = new IngestTrackingPointUseCase(trackingRepo, kayakRepo)

    kayakRepo.findById.mockResolvedValue(makeKayak())
    trackingRepo.create.mockResolvedValue(makePoint())

    const result = await useCase.execute({
      kayakId: 'uuid-kayak-1',
      latitude: -23.9618,
      longitude: -46.3322,
      speedKmh: 4.5,
      batteryLevel: 87,
    })

    expect(result.kayakId).toBe('uuid-kayak-1')
    expect(result.latitude).toBe(-23.9618)
    expect(trackingRepo.create).toHaveBeenCalledTimes(1)
  })

  it('deve lançar NotFoundException quando caiaque não existe', async () => {
    const trackingRepo = makeMockTrackingRepo()
    const kayakRepo = makeMockKayakRepo()
    const useCase = new IngestTrackingPointUseCase(trackingRepo, kayakRepo)

    kayakRepo.findById.mockResolvedValue(null)

    await expect(
      useCase.execute({
        kayakId: 'uuid-inexistente',
        latitude: -23.9618,
        longitude: -46.3322,
      }),
    ).rejects.toThrow(NotFoundException)

    expect(trackingRepo.create).not.toHaveBeenCalled()
  })
})

describe('GetTrackingUseCase', () => {
  it('deve retornar último ponto de rastreamento do caiaque', async () => {
    const trackingRepo = makeMockTrackingRepo()
    const useCase = new GetTrackingUseCase(trackingRepo)
    const point = makePoint()

    trackingRepo.findLatestByKayakId.mockResolvedValue(point)

    const result = await useCase.getLatest('uuid-kayak-1')
    expect(result.kayakId).toBe('uuid-kayak-1')
    expect(result.latitude).toBe(-23.9618)
  })

  it('deve lançar NotFoundException quando não há pontos para o caiaque', async () => {
    const trackingRepo = makeMockTrackingRepo()
    const useCase = new GetTrackingUseCase(trackingRepo)

    trackingRepo.findLatestByKayakId.mockResolvedValue(null)

    await expect(useCase.getLatest('uuid-kayak-1')).rejects.toThrow(NotFoundException)
  })

  it('deve retornar histórico de pontos por período', async () => {
    const trackingRepo = makeMockTrackingRepo()
    const useCase = new GetTrackingUseCase(trackingRepo)
    const points = [
      makePoint({ id: 'p1', recordedAt: new Date('2025-01-01T08:00:00') }),
      makePoint({ id: 'p2', recordedAt: new Date('2025-01-01T09:00:00') }),
      makePoint({ id: 'p3', recordedAt: new Date('2025-01-01T10:00:00') }),
    ]

    trackingRepo.findByKayakIdAndDateRange.mockResolvedValue(points)

    const result = await useCase.getHistory(
      'uuid-kayak-1',
      new Date('2025-01-01T08:00:00'),
      new Date('2025-01-01T18:00:00'),
    )

    expect(result).toHaveLength(3)
    expect(trackingRepo.findByKayakIdAndDateRange).toHaveBeenCalledWith(
      'uuid-kayak-1',
      expect.any(Date),
      expect.any(Date),
    )
  })

  it('deve retornar todos os pontos do caiaque sem filtro de data', async () => {
    const trackingRepo = makeMockTrackingRepo()
    const useCase = new GetTrackingUseCase(trackingRepo)

    trackingRepo.findByKayakId.mockResolvedValue([makePoint(), makePoint({ id: 'p2' })])

    const result = await useCase.getAllByKayak('uuid-kayak-1')
    expect(result).toHaveLength(2)
  })
})