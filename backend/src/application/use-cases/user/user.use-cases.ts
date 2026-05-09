import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common'
import { USER_REPOSITORY, type IUserRepository } from '../../../domain/repositories/user.repository'
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../dtos/user.dto'
import { User } from '../../../domain/entities/user.entity'

const toResponse = (user: User): UserResponseDto => ({
  id: user.id,
  username: user.username,
  role: user.role,
  active: user.active,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.userRepository.existsByUsername(dto.username)
    if (exists) {
      throw new BadRequestException(`Username '${dto.username}' já está em uso`)
    }
    const user = await this.userRepository.create({
      username: dto.username,
      password: dto.password, // TODO: hash com bcrypt na próxima iteração
      role: dto.role!,
      active: true,
    })
    return toResponse(user)
  }
}

@Injectable()
export class GetUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id)
    if (!user) throw new NotFoundException(`Usuário '${id}' não encontrado`)
    return toResponse(user)
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll()
    return users.map(toResponse)
  }
}

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const exists = await this.userRepository.findById(id)
    if (!exists) throw new NotFoundException(`Usuário '${id}' não encontrado`)

    const updated = await this.userRepository.update(id, {
      ...(dto.password && { password: dto.password }),
      ...(dto.role && { role: dto.role }),
      ...(dto.active !== undefined && { active: dto.active }),
    })
    return toResponse(updated)
  }
}

@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const exists = await this.userRepository.findById(id)
    if (!exists) throw new NotFoundException(`Usuário '${id}' não encontrado`)
    await this.userRepository.delete(id)
  }
}