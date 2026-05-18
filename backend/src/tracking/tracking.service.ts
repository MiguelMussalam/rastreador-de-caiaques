import { Injectable, Inject } from '@nestjs/common'
import { TrackingGateway } from './tracking.gateway'
import { PosicaoDto } from './posicao.dto'
import type { IKayakRepository } from '../domain/repositories/kayak.repository'
import { KAYAK_REPOSITORY } from '../domain/repositories/kayak.repository'
import type { ITrackingPointRepository } from '../domain/repositories/tracking-point.repository'
import { TRACKING_POINT_REPOSITORY } from '../domain/repositories/tracking-point.repository'
import { KayakStatus } from '../domain/entities/kayak.entity'

@Injectable()
export class TrackingService {
  private ultimasPosicoes = new Map<number, PosicaoDto>()

  constructor(
    private readonly gateway: TrackingGateway,
    @Inject(KAYAK_REPOSITORY) private readonly kayakRepo: IKayakRepository,
    @Inject(TRACKING_POINT_REPOSITORY) private readonly trackingRepo: ITrackingPointRepository,
  ) {}

  async ingerir(dto: PosicaoDto): Promise<void> {
    // Mantém última posição em memória para consulta rápida
    this.ultimasPosicoes.set(dto.id, dto)

    // Persiste no banco de forma assíncrona (não bloqueia o broadcast)
    this.persistir(dto).catch(err => console.error('[Tracking] Erro ao persistir:', err))

    // Broadcast em tempo real para todos os browsers conectados
    this.gateway.broadcast(dto)
  }

  private async persistir(dto: PosicaoDto): Promise<void> {
    // Localiza ou auto-registra o caiaque pelo deviceId do firmware
    let kayak = await this.kayakRepo.findByDeviceId(dto.id)
    if (!kayak) {
      kayak = await this.kayakRepo.create({
        code:     String(dto.id),
        name:     `Caiaque ${dto.id}`,
        deviceId: dto.id,
        status:   KayakStatus.IN_USE,
        active:   true,
      })
    } else if (kayak.status !== KayakStatus.IN_USE) {
      await this.kayakRepo.update(kayak.id, { status: KayakStatus.IN_USE })
    }

    await this.trackingRepo.create({
      kayakId:      kayak.id,
      latitude:     dto.lat,
      longitude:    dto.lng,
      speedKmh:     dto.vel ?? undefined,
      batteryLevel: dto.bat ?? undefined,
    })
  }

  listarUltimas(): PosicaoDto[] {
    return [...this.ultimasPosicoes.values()]
  }
}
