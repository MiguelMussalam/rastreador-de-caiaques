import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { TrackingService } from './tracking.service'
import { TrackingGateway } from './tracking.gateway'
import { PosicaoDto } from './posicao.dto'

@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly gateway: TrackingGateway,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async ingerir(@Body() dto: PosicaoDto) {
    await this.trackingService.ingerir(dto)
    return { ok: true }
  }

  @Get()
  listar() {
    return this.trackingService.listarUltimas()
  }

  @Get('heartbeat')
  @HttpCode(HttpStatus.OK)
  heartbeat() {
    this.gateway.broadcast({ tipo: 'base' })
    return { ok: true }
  }
}
