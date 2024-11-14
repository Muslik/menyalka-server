import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const REQUEST_USER = 'user';

export const RequestUser = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();

  return request[REQUEST_USER] || null;
});
