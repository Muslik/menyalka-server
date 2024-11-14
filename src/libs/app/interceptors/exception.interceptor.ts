import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppConfigService, CONFIG_SERVICE } from '~/config';
import { ExceptionBase, InternalServerErrorException } from '~/libs/exceptions';

import { AppRequestContext } from '../context/app-request-context';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(CONFIG_SERVICE) private readonly configService: AppConfigService,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<ExceptionBase> {
    return next.handle().pipe(
      catchError((err) => {
        let resultErr = err;
        console.log('CAtch error', err);
        if (!(resultErr instanceof ExceptionBase)) {
          resultErr = new InternalServerErrorException();
          if (this.configService.isDevelopment) {
            resultErr.message = err.message;
            resultErr.stack = err.stack;
          }
        }

        if (!resultErr.correlationId) {
          resultErr.correlationId = AppRequestContext.getRequestId();
        }

        if (resultErr.statusCode >= 400 && resultErr.statusCode < 500) {
          this.logger.debug(`[${AppRequestContext.getRequestId()}] ${resultErr.message}`);
        }

        return throwError(() => resultErr);
      }),
    );
  }
}
