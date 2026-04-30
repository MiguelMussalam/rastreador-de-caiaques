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
exports.DeleteKayakUseCase = exports.UpdateKayakUseCase = exports.GetKayakUseCase = exports.RegisterKayakUseCase = void 0;
const common_1 = require("@nestjs/common");
const kayak_repository_1 = require("../../../domain/repositories/kayak.repository");
const kayak_entity_1 = require("../../../domain/entities/kayak.entity");
const toResponse = (kayak) => ({
    id: kayak.id,
    code: kayak.code,
    name: kayak.name,
    status: kayak.status,
    active: kayak.active,
    createdAt: kayak.createdAt,
    updatedAt: kayak.updatedAt,
});
let RegisterKayakUseCase = class RegisterKayakUseCase {
    kayakRepository;
    constructor(kayakRepository) {
        this.kayakRepository = kayakRepository;
    }
    async execute(dto) {
        const exists = await this.kayakRepository.existsByCode(dto.code);
        if (exists) {
            throw new common_1.BadRequestException(`Código '${dto.code}' já está cadastrado`);
        }
        const kayak = await this.kayakRepository.create({
            code: dto.code,
            name: dto.name,
            status: kayak_entity_1.KayakStatus.AVAILABLE,
            active: true,
        });
        return toResponse(kayak);
    }
};
exports.RegisterKayakUseCase = RegisterKayakUseCase;
exports.RegisterKayakUseCase = RegisterKayakUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(kayak_repository_1.KAYAK_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], RegisterKayakUseCase);
let GetKayakUseCase = class GetKayakUseCase {
    kayakRepository;
    constructor(kayakRepository) {
        this.kayakRepository = kayakRepository;
    }
    async findById(id) {
        const kayak = await this.kayakRepository.findById(id);
        if (!kayak)
            throw new common_1.NotFoundException(`Caiaque '${id}' não encontrado`);
        return toResponse(kayak);
    }
    async findAll() {
        const kayaks = await this.kayakRepository.findAll();
        return kayaks.map(toResponse);
    }
    async findByStatus(status) {
        const kayaks = await this.kayakRepository.findByStatus(status);
        return kayaks.map(toResponse);
    }
};
exports.GetKayakUseCase = GetKayakUseCase;
exports.GetKayakUseCase = GetKayakUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(kayak_repository_1.KAYAK_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetKayakUseCase);
let UpdateKayakUseCase = class UpdateKayakUseCase {
    kayakRepository;
    constructor(kayakRepository) {
        this.kayakRepository = kayakRepository;
    }
    async execute(id, dto) {
        const exists = await this.kayakRepository.findById(id);
        if (!exists)
            throw new common_1.NotFoundException(`Caiaque '${id}' não encontrado`);
        const updated = await this.kayakRepository.update(id, {
            ...(dto.name && { name: dto.name }),
            ...(dto.status && { status: dto.status }),
            ...(dto.active !== undefined && { active: dto.active }),
        });
        return toResponse(updated);
    }
};
exports.UpdateKayakUseCase = UpdateKayakUseCase;
exports.UpdateKayakUseCase = UpdateKayakUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(kayak_repository_1.KAYAK_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateKayakUseCase);
let DeleteKayakUseCase = class DeleteKayakUseCase {
    kayakRepository;
    constructor(kayakRepository) {
        this.kayakRepository = kayakRepository;
    }
    async execute(id) {
        const exists = await this.kayakRepository.findById(id);
        if (!exists)
            throw new common_1.NotFoundException(`Caiaque '${id}' não encontrado`);
        await this.kayakRepository.delete(id);
    }
};
exports.DeleteKayakUseCase = DeleteKayakUseCase;
exports.DeleteKayakUseCase = DeleteKayakUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(kayak_repository_1.KAYAK_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeleteKayakUseCase);
//# sourceMappingURL=kayak.use-cases.js.map