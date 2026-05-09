export class TrackingPoint {
  id: string
  kayakId: string
  latitude: number
  longitude: number
  speedKmh?: number
  batteryLevel?: number
  recordedAt: Date
}