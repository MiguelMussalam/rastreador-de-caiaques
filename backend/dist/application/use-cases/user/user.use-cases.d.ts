import { type IUserRepository } from '../../../domain/repositories/user.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../dtos/user.dto';
export declare class CreateUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(dto: CreateUserDto): Promise<UserResponseDto>;
}
export declare class GetUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    findById(id: string): Promise<UserResponseDto>;
    findAll(): Promise<UserResponseDto[]>;
}
export declare class UpdateUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto>;
}
export declare class DeleteUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(id: string): Promise<void>;
}
