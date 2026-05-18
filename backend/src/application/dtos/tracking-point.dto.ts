export class IngestTrackingPointDto {
  kayakId: string
  latitude: number
  longitude: number
  speedKmh?: number
  batteryLevel?: number
}

export class TrackingPointResponseDto {
  id: string
  kayakId: string
  latitude: number
  longitude: number
  speedKmh?: number
  batteryLevel?: number
  recordedAt: Date
}