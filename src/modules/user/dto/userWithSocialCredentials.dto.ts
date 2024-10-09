import { B } from '~/infrastructure/database';

export type UserWithSocialCredentialsDto = {
  username: B.Username;
  providerType: string;
  providerUserId: B.ProviderUserId;
};
