import { UserId } from '~/libs/database';

export class SessionCreateDto {
  userAgent: string;
  ip: string;
  userId: UserId;
}
