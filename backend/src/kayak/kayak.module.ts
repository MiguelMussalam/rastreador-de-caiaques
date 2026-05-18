import { Module } from '@nestjs/common'
import { InfrastructureModule } from '../infrastructure/infrastructure.module'
import { KayakController } from './kayak.controller'
import { RegisterKayakUseCase, GetKayakUseCase, UpdateKayakUseCase, DeleteKayakUseCase } from '../application/use-cases/kayak/kayak.use-cases'
import { GetTrackingUseCase } from '../application/use-cases/tracking/tracking.use-cases'

@Module({
  imports:     [InfrastructureModule],
  controllers: [KayakController],
  providers:   [RegisterKayakUseCase, GetKayakUseCase, UpdateKayakUseCase, DeleteKayakUseCase, GetTrackingUseCase],
})
export class KayakModule {}
