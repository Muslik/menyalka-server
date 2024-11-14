import { ApiProperty } from '@nestjs/swagger';

import { config } from '~/config';

import { AppRequestContext } from '../app/context/app-request-context';

export interface SerializedException {
  message: string;
  code: string;
  statusCode: number;
  constraints?: Record<string, string>;
  correlationId?: string;
  stack?: string;
  cause?: string;
}

export abstract class ExceptionBase extends Error {
  abstract _tag: string;
  @ApiProperty({ example: 400 })
  abstract statusCode: number;

  public readonly constraints?: Record<string, string>;
  public readonly correlationId: string;

  constructor(
    readonly message: string,
    readonly cause?: Error,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.correlationId = AppRequestContext.getRequestId();
  }

  toJSON(): SerializedException {
    const errorObject: SerializedException = {
      message: this.message,
      code: this._tag,
      statusCode: this.statusCode,
      constraints: this.constraints,
    };

    if (config().isDevelopment) {
      errorObject.correlationId = this.correlationId;
      errorObject.stack = this.stack;
      errorObject.cause = this.cause?.message;
    }

    return errorObject;
  }
}
