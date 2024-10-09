import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExceptionBase, InternalServerErrorException } from 'src/infrastructure/exceptions';

export class UnexpectedException extends InternalServerErrorException {
  constructor(inner?: unknown) {
    super('UNEXPECTED_EXCEPTION', 'Internal server error', inner);
  }
}

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) { }

  intercept(_context: ExecutionContext, next: CallHandler): Observable<ExceptionBase> {
    return next.handle().pipe(
      catchError((err) => {
        return throwError(() => {
          const exception = err instanceof ExceptionBase ? err : new UnexpectedException(err);

          if (!(err instanceof ExceptionBase)) {
            this.logger.error(err, 'UnexpectedException');
          }

          return {
            data: exception.type,
            code: exception.code,
            message: exception.message,
            statusCode: exception.statusCode,
          };
        });
      }),
    );
  }
}
