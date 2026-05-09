import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { TrackingService } from './tracking.service'
import { PosicaoDto } from './posicao.dto'

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  ingerir(@Body() dto: PosicaoDto) {
    this.trackingService.ingerir(dto)
    return { ok: true }
  }

  @Get()
  listar() {
    return this.trackingService.listarUltimas()
  }
}
