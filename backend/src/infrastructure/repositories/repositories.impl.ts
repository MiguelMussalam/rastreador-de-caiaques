import { Injectable } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { IKayakRepository } from '../../domain/repositories/kayak.repository'
import { IUserRepository } from '../../domain/repositories/user.repository'
import { ITrackingPointRepository } from '../../domain/repositories/tracking-point.repository'
import { Kayak, KayakStatus } from '../../domain/entities/kayak.entity'
import { User, UserRole } from '../../domain/entities/user.entity'
import { TrackingPoint } from '../../domain/entities/tracking-point.entity'

// ─── Kayak ───────────────────────────────────────────────────────────────────

@Injectable()
export class KayakRepositoryImpl implements IKayakRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Kayak, 'id' | 'createdAt' | 'updatedAt'>): Promise<Kayak> {
    const row = await this.prisma.kayak.create({ data })
    return this.toKayak(row)
  }

  async findById(id: string): Promise<Kayak | null> {
    const row = await this.prisma.kayak.findUnique({ where: { id } })
    return row ? this.toKayak(row) : null
  }

  async findByDeviceId(deviceId: number): Promise<Kayak | null> {
    const row = await this.prisma.kayak.findUnique({ where: { deviceId } })
    return row ? this.toKayak(row) : null
  }

  async findAll(): Promise<Kayak[]> {
    const rows = await this.prisma.kayak.findMany()
    return rows.map(r => this.toKayak(r))
  }

  async findByStatus(status: KayakStatus): Promise<Kayak[]> {
    const rows = await this.prisma.kayak.findMany({ where: { status } })
    return rows.map(r => this.toKayak(r))
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.kayak.count({ where: { code } })
    return count > 0
  }

  async update(id: string, data: Partial<Omit<Kayak, 'id' | 'code' | 'createdAt' | 'updatedAt'>>): Promise<Kayak> {
    const row = await this.prisma.kayak.update({ where: { id }, data })
    return this.toKayak(row)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kayak.delete({ where: { id } })
  }

  private toKayak(row: any): Kayak {
    return {
      id:        row.id,
      code:      row.code,
      name:      row.name,
      deviceId:  row.deviceId ?? undefined,
      status:    row.status as KayakStatus,
      active:    row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

// ─── TrackingPoint ────────────────────────────────────────────────────────────

@Injectable()
export class TrackingPointRepositoryImpl implements ITrackingPointRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<TrackingPoint, 'id' | 'recordedAt'>): Promise<TrackingPoint> {
    const row = await this.prisma.trackingPoint.create({ data })
    return this.toPoint(row)
  }

  async findLatestByKayakId(kayakId: string): Promise<TrackingPoint | null> {
    const row = await this.prisma.trackingPoint.findFirst({
      where:   { kayakId },
      orderBy: { recordedAt: 'desc' },
    })
    return row ? this.toPoint(row) : null
  }

  async findByKayakId(kayakId: string): Promise<TrackingPoint[]> {
    const rows = await this.prisma.trackingPoint.findMany({
      where:   { kayakId },
      orderBy: { recordedAt: 'asc' },
    })
    return rows.map(r => this.toPoint(r))
  }

  async findByKayakIdAndDateRange(kayakId: string, from: Date, to: Date): Promise<TrackingPoint[]> {
    const rows = await this.prisma.trackingPoint.findMany({
      where:   { kayakId, recordedAt: { gte: from, lte: to } },
      orderBy: { recordedAt: 'asc' },
    })
    return rows.map(r => this.toPoint(r))
  }

  async deleteByKayakId(kayakId: string): Promise<void> {
    await this.prisma.trackingPoint.deleteMany({ where: { kayakId } })
  }

  private toPoint(row: any): TrackingPoint {
    return {
      id:           row.id,
      kayakId:      row.kayakId,
      latitude:     row.latitude,
      longitude:    row.longitude,
      speedKmh:     row.speedKmh  ?? undefined,
      batteryLevel: row.batteryLevel ?? undefined,
      recordedAt:   row.recordedAt,
    }
  }
}

// ─── User ─────────────────────────────────────────────────────────────────────

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const row = await this.prisma.user.create({ data })
    return this.toUser(row)
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? this.toUser(row) : null
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany()
    return rows.map(r => this.toUser(r))
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { username } })
    return count > 0
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'username' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const row = await this.prisma.user.update({ where: { id }, data })
    return this.toUser(row)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }

  private toUser(row: any): User {
    return {
      id:        row.id,
      username:  row.username,
      password:  row.password,
      role:      row.role as UserRole,
      active:    row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
