import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { RegisterKayakUseCase, GetKayakUseCase, UpdateKayakUseCase, DeleteKayakUseCase } from '../application/use-cases/kayak/kayak.use-cases'
import { GetTrackingUseCase } from '../application/use-cases/tracking/tracking.use-cases'
import { CreateKayakDto, UpdateKayakDto } from '../application/dtos/kayak.dto'

@Controller('kayaks')
export class KayakController {
  constructor(
    private readonly registerKayak: RegisterKayakUseCase,
    private readonly getKayak: GetKayakUseCase,
    private readonly updateKayak: UpdateKayakUseCase,
    private readonly deleteKayak: DeleteKayakUseCase,
    private readonly getTracking: GetTrackingUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateKayakDto) {
    return this.registerKayak.execute(dto)
  }

  @Get()
  findAll() {
    return this.getKayak.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getKayak.findById(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKayakDto) {
    return this.updateKayak.execute(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteKayak.execute(id)
  }

  @Get(':id/tracking')
  history(@Param('id') kayakId: string) {
    return this.getTracking.getAllByKayak(kayakId)
  }

  @Get(':id/tracking/latest')
  latest(@Param('id') kayakId: string) {
    return this.getTracking.getLatest(kayakId)
  }
}
