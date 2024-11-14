import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { ExceptionBase } from '~/libs/exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<ExceptionBase> {
  constructor() {}

  catch(exception: ExceptionBase, argumentsHost: ArgumentsHost) {
    const baseException = exception;

    const response = argumentsHost.switchToHttp().getResponse<FastifyReply>();
    const status = baseException.statusCode || 500;
    response.status(status).send(typeof baseException.toJSON === 'function' ? baseException.toJSON() : baseException);
  }
}
