import { Effect } from "effect";

type User = {
  firstName: string;
  lastName?: string;
  id: number;
  isBot?: boolean;
  isPremium?: boolean;
  photoUrl?: string;
  username?: string;
}

export type AuthData = User

export interface TelegramServicePort {
  validateAuthData(authData: string): Effect.Effect<AuthData, Error>;
}
