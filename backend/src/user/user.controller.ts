import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { CreateUserUseCase, GetUserUseCase, UpdateUserUseCase, DeleteUserUseCase } from '../application/use-cases/user/user.use-cases'
import { CreateUserDto, UpdateUserDto } from '../application/dtos/user.dto'

@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto)
  }

  @Get()
  findAll() {
    return this.getUser.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getUser.findById(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUser.execute(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteUser.execute(id)
  }
}
