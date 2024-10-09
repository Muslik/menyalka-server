import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';

export const SESSION_ID = 'sessionId';

export function Auth() {
  return applyDecorators(ApiCookieAuth(SESSION_ID));
}
