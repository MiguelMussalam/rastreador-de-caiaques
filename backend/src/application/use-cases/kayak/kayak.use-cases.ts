import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common'
import type { IKayakRepository } from '../../../domain/repositories/kayak.repository'
import { KAYAK_REPOSITORY } from '../../../domain/repositories/kayak.repository'
import { CreateKayakDto, KayakResponseDto, UpdateKayakDto } from '../../dtos/kayak.dto'
import { Kayak, KayakStatus } from '../../../domain/entities/kayak.entity'

const toResponse = (kayak: Kayak): KayakResponseDto => ({
  id: kayak.id,
  code: kayak.code,
  name: kayak.name,
  status: kayak.status,
  active: kayak.active,
  createdAt: kayak.createdAt,
  updatedAt: kayak.updatedAt,
})

@Injectable()
export class RegisterKayakUseCase {
  constructor(@Inject(KAYAK_REPOSITORY) private readonly kayakRepository: IKayakRepository) {}

  async execute(dto: CreateKayakDto): Promise<KayakResponseDto> {
    const exists = await this.kayakRepository.existsByCode(dto.code)
    if (exists) {
      throw new BadRequestException(`Código '${dto.code}' já está cadastrado`)
    }
    const kayak = await this.kayakRepository.create({
      code: dto.code,
      name: dto.name,
      status: KayakStatus.AVAILABLE,
      active: true,
    })
    return toResponse(kayak)
  }
}

@Injectable()
export class GetKayakUseCase {
  constructor(@Inject(KAYAK_REPOSITORY) private readonly kayakRepository: IKayakRepository) {}

  async findById(id: string): Promise<KayakResponseDto> {
    const kayak = await this.kayakRepository.findById(id)
    if (!kayak) throw new NotFoundException(`Caiaque '${id}' não encontrado`)
    return toResponse(kayak)
  }

  async findAll(): Promise<KayakResponseDto[]> {
    const kayaks = await this.kayakRepository.findAll()
    return kayaks.map(toResponse)
  }

  async findByStatus(status: KayakStatus): Promise<KayakResponseDto[]> {
    const kayaks = await this.kayakRepository.findByStatus(status)
    return kayaks.map(toResponse)
  }
}

@Injectable()
export class UpdateKayakUseCase {
  constructor(@Inject(KAYAK_REPOSITORY) private readonly kayakRepository: IKayakRepository) {}

  async execute(id: string, dto: UpdateKayakDto): Promise<KayakResponseDto> {
    const exists = await this.kayakRepository.findById(id)
    if (!exists) throw new NotFoundException(`Caiaque '${id}' não encontrado`)

    const updated = await this.kayakRepository.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.status && { status: dto.status }),
      ...(dto.active !== undefined && { active: dto.active }),
    })
    return toResponse(updated)
  }
}

@Injectable()
export class DeleteKayakUseCase {
  constructor(@Inject(KAYAK_REPOSITORY) private readonly kayakRepository: IKayakRepository) {}

  async execute(id: string): Promise<void> {
    const exists = await this.kayakRepository.findById(id)
    if (!exists) throw new NotFoundException(`Caiaque '${id}' não encontrado`)
    await this.kayakRepository.delete(id)
  }
}