import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { RateLimitException } from '../../exceptions';

class RateLimitError extends RateLimitException {}

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected async throwThrottlingException() {
    throw new RateLimitError();
  }
}
