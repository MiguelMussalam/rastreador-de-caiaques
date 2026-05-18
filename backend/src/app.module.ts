import { Module } from '@nestjs/common'
import { TrackingModule } from './tracking/tracking.module'
import { KayakModule } from './kayak/kayak.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [TrackingModule, KayakModule, UserModule],
})
export class AppModule {}
