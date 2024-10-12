import { RequestContextService } from "~/libs/app/context/app-request-context";

export interface SerializedException {
  message: string;
  code: string;
  correlationId: string;
  stack?: string;
  cause?: string;
  metadata?: unknown;
}

export abstract class ExceptionBase extends Error {
  abstract code: string;

  public readonly correlationId: string;

  constructor(readonly message: string, readonly cause?: Error, readonly metadata?: unknown) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    const ctx = RequestContextService.getRequestId();
    this.correlationId = ctx;
  }

  toJSON(): SerializedException {
    return {
      message: this.message,
      code: this.code,
      correlationId: this.correlationId,
      stack: this.stack,
      cause: this.cause?.message,
      metadata: this.metadata,
    };
  }
}
