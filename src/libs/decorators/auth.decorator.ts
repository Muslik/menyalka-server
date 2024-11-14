import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { SESSION_ID } from '~/config/config.constants';

import { UnauthorizedException } from '../exceptions';

export const ApiAuth = () => {
  return applyDecorators(
    ApiCookieAuth(SESSION_ID),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: UnauthorizedException,
    }),
  );
};
