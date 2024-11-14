import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Cause, Exit } from 'effect';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class EffectInterceptor implements NestInterceptor {
  constructor() {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((responseBody) => {
        if (Exit.isExit(responseBody)) {
          return Exit.match(responseBody, {
            onSuccess: (result) => result,
            onFailure: (cause) => {
              const error = Cause.squash(cause);
              throw error;
            },
          });
        }

        return responseBody;
      }),
    );
  }
}
