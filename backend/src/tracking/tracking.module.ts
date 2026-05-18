import { Module } from '@nestjs/common'
import { InfrastructureModule } from '../infrastructure/infrastructure.module'
import { TrackingController } from './tracking.controller'
import { TrackingService } from './tracking.service'
import { TrackingGateway } from './tracking.gateway'

@Module({
  imports:     [InfrastructureModule],
  controllers: [TrackingController],
  providers:   [TrackingGateway, TrackingService],
})
export class TrackingModule {}
