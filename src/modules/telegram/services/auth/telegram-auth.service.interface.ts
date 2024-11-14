import { InitData } from '@telegram-apps/init-data-node';
import { Effect } from 'effect';

export interface ITelegramAuthService {
  validateAuthData(authData: string): Effect.Effect<InitData, Error>;
}
