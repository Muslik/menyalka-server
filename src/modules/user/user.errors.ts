import { BadRequestException } from '~/infrastructure/exceptions';

enum UserExceptionCodes {
  RoleIdInvalid = 'USER.ROLE_ID_INVALID',
  UserIdInvalid = 'USER.USER_ID_INVALID',
}

export class RoleIdInvalidError extends BadRequestException {
  constructor() {
    super(UserExceptionCodes.RoleIdInvalid, 'RoleId is invalid');
  }
}

export class UserIdInvalidError extends BadRequestException {
  constructor() {
    super(UserExceptionCodes.UserIdInvalid, 'UserId is invalid');
  }
}
