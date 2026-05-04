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
exports.DeleteUserUseCase = exports.UpdateUserUseCase = exports.GetUserUseCase = exports.CreateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../../../domain/repositories/user.repository");
const toResponse = (user) => ({
    id: user.id,
    username: user.username,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
let CreateUserUseCase = class CreateUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(dto) {
        const exists = await this.userRepository.existsByUsername(dto.username);
        if (exists) {
            throw new common_1.BadRequestException(`Username '${dto.username}' já está em uso`);
        }
        const user = await this.userRepository.create({
            username: dto.username,
            password: dto.password,
            role: dto.role,
            active: true,
        });
        return toResponse(user);
    }
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateUserUseCase);
let GetUserUseCase = class GetUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findById(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            throw new common_1.NotFoundException(`Usuário '${id}' não encontrado`);
        return toResponse(user);
    }
    async findAll() {
        const users = await this.userRepository.findAll();
        return users.map(toResponse);
    }
};
exports.GetUserUseCase = GetUserUseCase;
exports.GetUserUseCase = GetUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetUserUseCase);
let UpdateUserUseCase = class UpdateUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id, dto) {
        const exists = await this.userRepository.findById(id);
        if (!exists)
            throw new common_1.NotFoundException(`Usuário '${id}' não encontrado`);
        const updated = await this.userRepository.update(id, {
            ...(dto.password && { password: dto.password }),
            ...(dto.role && { role: dto.role }),
            ...(dto.active !== undefined && { active: dto.active }),
        });
        return toResponse(updated);
    }
};
exports.UpdateUserUseCase = UpdateUserUseCase;
exports.UpdateUserUseCase = UpdateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateUserUseCase);
let DeleteUserUseCase = class DeleteUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id) {
        const exists = await this.userRepository.findById(id);
        if (!exists)
            throw new common_1.NotFoundException(`Usuário '${id}' não encontrado`);
        await this.userRepository.delete(id);
    }
};
exports.DeleteUserUseCase = DeleteUserUseCase;
exports.DeleteUserUseCase = DeleteUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DeleteUserUseCase);
//# sourceMappingURL=user.use-cases.js.map