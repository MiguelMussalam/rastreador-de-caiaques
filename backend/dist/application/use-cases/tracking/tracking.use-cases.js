"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTrackingUseCase = exports.IngestTrackingPointUseCase = void 0;
const common_1 = require("@nestjs/common");
const tracking_point_repository_1 = require("../../../domain/repositories/tracking-point.repository");
const kayak_repository_1 = require("../../../domain/repositories/kayak.repository");
const toResponse = (point) => ({
    id: point.id,
    kayakId: point.kayakId,
    latitude: point.latitude,
    longitude: point.longitude,
    speedKmh: point.speedKmh,
    batteryLevel: point.batteryLevel,
    recordedAt: point.recordedAt,
});
let IngestTrackingPointUseCase = class IngestTrackingPointUseCase {
    trackingRepo;
    kayakRepo;
    constructor(trackingRepo, kayakRepo) {
        this.trackingRepo = trackingRepo;
        this.kayakRepo = kayakRepo;
    }
    async execute(dto) {
        const kayak = await this.kayakRepo.findById(dto.kayakId);
        if (!kayak)
            throw new common_1.NotFoundException(`Caiaque '${dto.kayakId}' não encontrado`);
        const point = await this.trackingRepo.create({
            kayakId: dto.kayakId,
            latitude: dto.latitude,
            longitude: dto.longitude,
            speedKmh: dto.speedKmh,
            batteryLevel: dto.batteryLevel,
        });
        return toResponse(point);
    }
};
exports.IngestTrackingPointUseCase = IngestTrackingPointUseCase;
exports.IngestTrackingPointUseCase = IngestTrackingPointUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tracking_point_repository_1.TRACKING_POINT_REPOSITORY)),
    __param(1, (0, common_1.Inject)(kayak_repository_1.KAYAK_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], IngestTrackingPointUseCase);
let GetTrackingUseCase = class GetTrackingUseCase {
    trackingRepo;
    constructor(trackingRepo) {
        this.trackingRepo = trackingRepo;
    }
    async getLatest(kayakId) {
        const point = await this.trackingRepo.findLatestByKayakId(kayakId);
        if (!point)
            throw new common_1.NotFoundException(`Nenhum ponto de rastreamento para o caiaque '${kayakId}'`);
        return toResponse(point);
    }
    async getHistory(kayakId, from, to) {
        const points = await this.trackingRepo.findByKayakIdAndDateRange(kayakId, from, to);
        return points.map(toResponse);
    }
    async getAllByKayak(kayakId) {
        const points = await this.trackingRepo.findByKayakId(kayakId);
        return points.map(toResponse);
    }
};
exports.GetTrackingUseCase = GetTrackingUseCase;
exports.GetTrackingUseCase = GetTrackingUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tracking_point_repository_1.TRACKING_POINT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetTrackingUseCase);
//# sourceMappingURL=tracking.use-cases.js.map