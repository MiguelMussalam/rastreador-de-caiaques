import { Module } from '@nestjs/common'
import { PrismaService } from './database/prisma.service'
import { KayakRepositoryImpl, TrackingPointRepositoryImpl, UserRepositoryImpl } from './repositories/repositories.impl'
import { KAYAK_REPOSITORY } from '../domain/repositories/kayak.repository'
import { TRACKING_POINT_REPOSITORY } from '../domain/repositories/tracking-point.repository'
import { USER_REPOSITORY } from '../domain/repositories/user.repository'

@Module({
  providers: [
    PrismaService,
    { provide: KAYAK_REPOSITORY,         useClass: KayakRepositoryImpl },
    { provide: TRACKING_POINT_REPOSITORY, useClass: TrackingPointRepositoryImpl },
    { provide: USER_REPOSITORY,          useClass: UserRepositoryImpl },
  ],
  exports: [KAYAK_REPOSITORY, TRACKING_POINT_REPOSITORY, USER_REPOSITORY],
})
export class InfrastructureModule {}
