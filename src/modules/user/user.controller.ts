import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { USER_SERVICE } from './user.constants';
import { IUserService } from './user.service.interface';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly userService: IUserService) {}

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }
}
