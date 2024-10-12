import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { pipe, Effect, Option } from 'effect';

import { B } from '~/infrastructure/database';

import { AssignRoleToUserDto } from './dto/assignRoleToUser.dto';
import { IUserServiceOptions } from './interfaces/userServiceOptions.interface';
import { USER_SERVICE, USER_SERVICE_OPTIONS } from './user.constants';
import { RoleIdInvalidError, UserIdInvalidError } from './user.errors';
import { IUserService } from './user.service.interface';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_SERVICE_OPTIONS) private readonly userServiceOptions: IUserServiceOptions,
  ) { }

  @Get()
  async getUsers(): Promise<any> {
    return pipe(this.userService.getUsers(), Effect.runPromise);
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @ApiBadRequestResponse({ description: 'Role id invalid', type: RoleIdInvalidError })
  @ApiBadRequestResponse({ description: 'User id invalid', type: UserIdInvalidError })
  @Post(':userId/role')
  async assignRoleToUser(@Param('userId', ParseIntPipe) userId: B.UserId, @Body() { roleId }: AssignRoleToUserDto) {
    return Effect.runPromise(
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
