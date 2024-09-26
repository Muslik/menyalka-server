import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ExceptionBase, InternalServerErrorException } from 'src/infrastructure/exceptions';

export class UnexpectedException extends InternalServerErrorException {
  constructor(inner?: unknown) {
    let currentInner = inner;

    if (process.env.NODE_ENV !== 'development') {
      currentInner = undefined;
    }

    super('UNEXPECTED_EXCEPTION', 'Internal server error', currentInner);
  }
}

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<ExceptionBase> {
    return next.handle().pipe(
      catchError((err) => {
        return throwError(() => {
          if (err instanceof ExceptionBase) {
            return err;
          }

          this.logger.error(err, 'UnexpectedException');
          return new UnexpectedException(err);
        });
      }),
      // На случай если controller вернет ошибку вместо того чтобы ее бросить
      map((data) => {
        if (data instanceof ExceptionBase) {
          throw data;
        }

        return data;
      }),
    );
  }
}
