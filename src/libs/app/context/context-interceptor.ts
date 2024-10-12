import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Observable, tap } from 'rxjs';

import { RequestContextService } from './app-request-context';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const requestId = request?.body?.requestId ?? nanoid(6);

    RequestContextService.setRequestId(requestId);

    return next.handle().pipe(tap(() => { }));
  }
}
