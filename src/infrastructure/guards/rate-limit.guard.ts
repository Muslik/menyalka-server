import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { BASE_EXCEPTION_CODES, RateLimitException } from '../exceptions';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async throwThrottlingException() {
    throw new RateLimitException(`${BASE_EXCEPTION_CODES.TOO_MANY_REQUESTS}.RATE_LIMIT`, 'Too many requests');
  }
}
