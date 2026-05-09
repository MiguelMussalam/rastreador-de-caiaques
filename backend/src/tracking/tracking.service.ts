import { Injectable } from '@nestjs/common'
import { TrackingGateway } from './tracking.gateway'
import { PosicaoDto } from './posicao.dto'

@Injectable()
export class TrackingService {
  private ultimasPosicoes = new Map<number, PosicaoDto>()

  constructor(private readonly gateway: TrackingGateway) {}

  ingerir(dto: PosicaoDto): void {
    this.ultimasPosicoes.set(dto.id, dto)
    this.gateway.broadcast(dto)
  }

  listarUltimas(): PosicaoDto[] {
    return [...this.ultimasPosicoes.values()]
  }
}
