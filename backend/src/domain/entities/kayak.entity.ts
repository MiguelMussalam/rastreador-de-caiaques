export enum KayakStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  ALERT = 'ALERT',
}
 
export class Kayak {
  id: string
  code: string
  name: string
  status: KayakStatus
  active: boolean
  createdAt: Date
  updatedAt: Date
}