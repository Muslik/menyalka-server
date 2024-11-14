import { ApiProperty } from '@nestjs/swagger';

import { ExceptionBase } from './exception.base';
import { ExceptionCodes } from './exception.codes';

export class UnauthorizedException extends ExceptionBase {
  @ApiProperty({ enum: [ExceptionCodes.UNAUTHORIZED], name: 'code' })
  _tag = ExceptionCodes.UNAUTHORIZED;
  readonly statusCode = 401;
}

export class ForbiddenException extends ExceptionBase {
  @ApiProperty({ enum: [ExceptionCodes.FORBIDDEN], name: 'code' })
  _tag = ExceptionCodes.FORBIDDEN;
  readonly statusCode = 403;
}

export class ConflictException extends ExceptionBase {
  @ApiProperty({ enum: [ExceptionCodes.CONFLICT], name: 'code' })
  _tag = ExceptionCodes.CONFLICT;
  readonly statusCode = 409;
}

export class NotFoundException extends ExceptionBase {
  @ApiProperty({ enum: [ExceptionCodes.NOT_FOUND], name: 'code' })
  _tag = ExceptionCodes.NOT_FOUND;
  readonly statusCode = 404;
}

export class RateLimitException extends ExceptionBase {
  static message = 'Too many requests';

  constructor(
    readonly message = BadRequestException.message,
    readonly cause?: Error,
  ) {
    super(message, cause);
  }

  @ApiProperty({ enum: [ExceptionCodes.TOO_MANY_REQUESTS], name: 'code' })
  _tag = ExceptionCodes.TOO_MANY_REQUESTS;
  readonly statusCode = 429;
}

export class BadRequestException extends ExceptionBase {
  static message = 'Bad request';

  constructor(
    readonly message = BadRequestException.message,
    readonly cause?: Error,
  ) {
    super(message, cause);
  }

  @ApiProperty({ enum: [ExceptionCodes.BAD_REQUEST], name: 'code' })
  _tag = ExceptionCodes.BAD_REQUEST;
  readonly statusCode = 400;
}

export class ValidationException extends ExceptionBase {
  static message = 'Validation error';

  constructor(
    readonly constraints: Record<string, string>,
    readonly cause?: Error,
  ) {
    super(ValidationException.message, cause);
  }

  @ApiProperty({ enum: [ExceptionCodes.VALIDATION_ERROR], name: 'code' })
  _tag = ExceptionCodes.VALIDATION_ERROR;
  readonly statusCode = 400;
}

export class InternalServerErrorException extends ExceptionBase {
  static message = 'Internal server error';

  constructor(
    readonly message = InternalServerErrorException.message,
    readonly cause?: Error,
  ) {
    super(message, cause);
  }

  @ApiProperty({ enum: [ExceptionCodes.INTERNAL_SERVER_ERROR], name: 'code' })
  _tag = ExceptionCodes.INTERNAL_SERVER_ERROR;
  readonly statusCode = 500;
}
