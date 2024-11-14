import { ApiProperty } from '@nestjs/swagger';

import { BadRequestException, ExceptionCodes, UnauthorizedException } from '~/libs/exceptions';

export class UnauthorizedError extends UnauthorizedException {
  @ApiProperty({ enum: [ExceptionCodes.AUTH_UNAUTHORIZED], name: 'code' })
  _tag = ExceptionCodes.AUTH_UNAUTHORIZED;
  constructor() {
    super('Unauthorized');
  }
}

export class InvalidCredentialsError extends UnauthorizedException {
  @ApiProperty({ enum: [ExceptionCodes.AUTH_UNAUTHORIZED], name: 'code' })
  _tag = ExceptionCodes.AUTH_UNAUTHORIZED;
  constructor() {
    super('Invalid credentials');
  }
}

export class UnknownProviderError extends UnauthorizedException {
  @ApiProperty({ enum: [ExceptionCodes.AUTH_UNAUTHORIZED], name: 'code' })
  _tag = ExceptionCodes.AUTH_UNAUTHORIZED;
  constructor() {
    super('Unknown provider');
  }
}

export class UsernameAlreadyExistsError extends BadRequestException {
  @ApiProperty({ enum: [ExceptionCodes.AUTH_USERNAME_ALREADY_EXISTS], name: 'code' })
  _tag = ExceptionCodes.AUTH_USERNAME_ALREADY_EXISTS;
  constructor() {
    super('User with this username already exists');
  }
}
