import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import type { ITrackingPointRepository } from '../../../domain/repositories/tracking-point.repository'
import { TRACKING_POINT_REPOSITORY } from '../../../domain/repositories/tracking-point.repository'
import type { IKayakRepository } from '../../../domain/repositories/kayak.repository'
import { KAYAK_REPOSITORY } from '../../../domain/repositories/kayak.repository'
import { IngestTrackingPointDto, TrackingPointResponseDto } from '../../dtos/tracking-point.dto'
import { TrackingPoint } from '../../../domain/entities/tracking-point.entity'

const toResponse = (point: TrackingPoint): TrackingPointResponseDto => ({
  id: point.id,
  kayakId: point.kayakId,
  latitude: point.latitude,
  longitude: point.longitude,
  speedKmh: point.speedKmh,
  batteryLevel: point.batteryLevel,
  recordedAt: point.recordedAt,
})

@Injectable()
export class IngestTrackingPointUseCase {
  constructor(
    @Inject(TRACKING_POINT_REPOSITORY) private readonly trackingRepo: ITrackingPointRepository,
    @Inject(KAYAK_REPOSITORY) private readonly kayakRepo: IKayakRepository,
  ) {}

  async execute(dto: IngestTrackingPointDto): Promise<TrackingPointResponseDto> {
    const kayak = await this.kayakRepo.findById(dto.kayakId)
    if (!kayak) throw new NotFoundException(`Caiaque '${dto.kayakId}' não encontrado`)

    const point = await this.trackingRepo.create({
      kayakId: dto.kayakId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speedKmh: dto.speedKmh,
      batteryLevel: dto.batteryLevel,
    })
    return toResponse(point)
  }
}

@Injectable()
export class GetTrackingUseCase {
  constructor(
    @Inject(TRACKING_POINT_REPOSITORY) private readonly trackingRepo: ITrackingPointRepository,
  ) {}

  async getLatest(kayakId: string): Promise<TrackingPointResponseDto> {
    const point = await this.trackingRepo.findLatestByKayakId(kayakId)
    if (!point) throw new NotFoundException(`Nenhum ponto de rastreamento para o caiaque '${kayakId}'`)
    return toResponse(point)
  }

  async getHistory(kayakId: string, from: Date, to: Date): Promise<TrackingPointResponseDto[]> {
    const points = await this.trackingRepo.findByKayakIdAndDateRange(kayakId, from, to)
    return points.map(toResponse)
  }

  async getAllByKayak(kayakId: string): Promise<TrackingPointResponseDto[]> {
    const points = await this.trackingRepo.findByKayakId(kayakId)
    return points.map(toResponse)
  }
}
