import type { ITrackingPointRepository } from '../../../domain/repositories/tracking-point.repository';
import type { IKayakRepository } from '../../../domain/repositories/kayak.repository';
import { IngestTrackingPointDto, TrackingPointResponseDto } from '../../dtos/tracking-point.dto';
export declare class IngestTrackingPointUseCase {
    private readonly trackingRepo;
    private readonly kayakRepo;
    constructor(trackingRepo: ITrackingPointRepository, kayakRepo: IKayakRepository);
    execute(dto: IngestTrackingPointDto): Promise<TrackingPointResponseDto>;
}
export declare class GetTrackingUseCase {
    private readonly trackingRepo;
    constructor(trackingRepo: ITrackingPointRepository);
    getLatest(kayakId: string): Promise<TrackingPointResponseDto>;
    getHistory(kayakId: string, from: Date, to: Date): Promise<TrackingPointResponseDto[]>;
    getAllByKayak(kayakId: string): Promise<TrackingPointResponseDto[]>;
}
