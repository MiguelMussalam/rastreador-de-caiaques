import { Module } from '@nestjs/common'
import { InfrastructureModule } from '../infrastructure/infrastructure.module'
import { UserController } from './user.controller'
import { CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase } from '../application/use-cases/user/user.use-cases'

@Module({
  imports:     [InfrastructureModule],
  controllers: [UserController],
  providers:   [CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase],
})
export class UserModule {}
