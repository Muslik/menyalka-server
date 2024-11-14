import { ApiProperty } from '@nestjs/swagger';

import { BadRequestException, ExceptionCodes } from '~/libs/exceptions';

export class RoleIdInvalidError extends BadRequestException {
  @ApiProperty({ enum: [ExceptionCodes.USER_ROLE_ID_INVALID], name: 'code' })
  _tag = ExceptionCodes.USER_ROLE_ID_INVALID;
  constructor() {
    super('RoleId is invalid');
  }
}

export class UserIdInvalidError extends BadRequestException {
  @ApiProperty({ enum: [ExceptionCodes.USER_USER_ID_INVALID], name: 'code' })
  _tag = ExceptionCodes.USER_USER_ID_INVALID;
  constructor() {
    super('UserId is invalid');
  }
}
