import type { IKayakRepository } from '../../../domain/repositories/kayak.repository';
import { CreateKayakDto, KayakResponseDto, UpdateKayakDto } from '../../dtos/kayak.dto';
import { KayakStatus } from '../../../domain/entities/kayak.entity';
export declare class RegisterKayakUseCase {
    private readonly kayakRepository;
    constructor(kayakRepository: IKayakRepository);
    execute(dto: CreateKayakDto): Promise<KayakResponseDto>;
}
export declare class GetKayakUseCase {
    private readonly kayakRepository;
    constructor(kayakRepository: IKayakRepository);
    findById(id: string): Promise<KayakResponseDto>;
    findAll(): Promise<KayakResponseDto[]>;
    findByStatus(status: KayakStatus): Promise<KayakResponseDto[]>;
}
export declare class UpdateKayakUseCase {
    private readonly kayakRepository;
    constructor(kayakRepository: IKayakRepository);
    execute(id: string, dto: UpdateKayakDto): Promise<KayakResponseDto>;
}
export declare class DeleteKayakUseCase {
    private readonly kayakRepository;
    constructor(kayakRepository: IKayakRepository);
    execute(id: string): Promise<void>;
}
