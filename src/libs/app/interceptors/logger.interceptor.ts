import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ExceptionBase } from '~/libs/exceptions';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    this.logger.setContext('HTTP');

    this.logger.info(
      {
        method: request.method,
        url: request.url,
      },
      `Request ${request.method} ${request.url} ${request.body ? `--- Body ${JSON.stringify(request.body)}` : ''}`,
    );

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const speed = Date.now() - now;
          this.logger.info(
            {
              method: request.method,
              url: request.originalUrl,
              speed,
            },
            `Finish request ${request.method} ${
              request.originalUrl
            } (200) (${speed} ms) --- Response ${JSON.stringify(responseBody)}`,
          );
        },
        error: (error: ExceptionBase) => {
          const speed = Date.now() - now;
          this.logger.info(
            {
              method: request.method,
              url: request.originalUrl,
              speed,
            },
            `Finish request ${request.method} ${request.originalUrl} (${
              error.statusCode
            }) (${speed} ms) --- Response ${JSON.stringify(error)}`,
          );
        },
      }),
    );
  }
}
