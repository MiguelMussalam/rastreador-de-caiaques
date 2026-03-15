import { TrackingPoint } from '../entities/tracking-point.entity'

export interface ITrackingPointRepository {
  create(data: Omit<TrackingPoint, 'id' | 'recordedAt'>): Promise<TrackingPoint>
  findLatestByKayakId(kayakId: string): Promise<TrackingPoint | null>
  findByKayakId(kayakId: string): Promise<TrackingPoint[]>
  findByKayakIdAndDateRange(
    kayakId: string,
    from: Date,
    to: Date,
  ): Promise<TrackingPoint[]>
  deleteByKayakId(kayakId: string): Promise<void>
}

export const TRACKING_POINT_REPOSITORY = Symbol('ITrackingPointRepository')