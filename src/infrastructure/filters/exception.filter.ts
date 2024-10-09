import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { EMPTY, throwError } from 'rxjs';
import { ExceptionBase, BASE_EXCEPTION_CODES } from 'src/infrastructure/exceptions';

const typesMap = new Map<string, number>()
  .set(BASE_EXCEPTION_CODES.UNAUTHORIZED, 401)
  .set(BASE_EXCEPTION_CODES.FORBIDDEN, 403)
  .set(BASE_EXCEPTION_CODES.NOT_FOUND, 404)
  .set(BASE_EXCEPTION_CODES.BAD_REQUEST, 400)
  .set(BASE_EXCEPTION_CODES.INTERNAL_SERVER_ERROR, 500);

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: ExceptionBase, argumentsHost: ArgumentsHost) {
    const baseException = exception;

    if (argumentsHost.getType() === 'http') {
      const request = argumentsHost.switchToHttp().getResponse();
      const status = typesMap.get(baseException.type) || 500;
      request.status(status).send(baseException);

      return EMPTY;
    }

    return throwError(() => exception);
  }
}
