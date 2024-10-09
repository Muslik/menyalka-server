import { BadRequestException, UnauthorizedException } from '~/infrastructure/exceptions';

export class UnauthorizedError extends UnauthorizedException {
  constructor() {
    super('AUTH.UNAUTHORIZED', 'Invalid credentials');
  }
}

export class UnknownProviderError extends UnauthorizedException {
  constructor() {
    super('AUTH.UNKNOWN_PROVIDER', 'Unknown provider');
  }
}

export class EmailAlreadyExistsError extends BadRequestException {
  constructor() {
    super('AUTH.EMAIL_ALREADY_EXISTS', 'User with this email already exists');
  }
}

export class UsernameAlreadyExistsError extends BadRequestException {
  constructor() {
    super('AUTH.USERNAME_ALREADY_EXISTS', 'User with this username already exists');
  }
}
