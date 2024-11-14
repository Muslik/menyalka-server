import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { pipe, Effect, Option } from 'effect';

import { UserId } from '~/libs/database';
import { ApiAuth } from '~/libs/decorators';
import { BadRequestException } from '~/libs/exceptions';

import { AssignRoleToUserDto } from './dto/assignRoleToUser.dto';
import { IUserServiceOptions } from './interfaces/userServiceOptions.interface';
import { USER_SERVICE, USER_SERVICE_OPTIONS } from './user.constants';
import { RoleIdInvalidError } from './user.errors';
import { IUserService } from './user.service.interface';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_SERVICE_OPTIONS) private readonly userServiceOptions: IUserServiceOptions,
  ) {}

  @Get()
  async getUsers(): Promise<any> {
    return Effect.runPromiseExit(this.userService.getUsers());
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiBadRequestResponse({ description: 'Role id invalid', type: BadRequestException })
  @ApiParam({
    name: 'userId',
    type: String,
  })
  @Post(':userId/role')
  async assignRoleToUser(@Param('userId', ParseIntPipe) userId: UserId, @Body() { roleId }: AssignRoleToUserDto) {
    return Effect.runPromiseExit(
      pipe(
        this.userServiceOptions.getRoleById(roleId),
        Effect.andThen((option) =>
          pipe(
            option,
            Option.match({
              onSome: (role) => this.userService.assignRoleToUser(userId, role.id),
              onNone: () => Effect.fail(new RoleIdInvalidError()),
            }),
          ),
        ),
      ),
    );
  }
}
