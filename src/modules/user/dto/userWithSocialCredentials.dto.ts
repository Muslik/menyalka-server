import { ProviderId, Username } from '~/libs/database';

export type UserWithSocialCredentialsDto = {
  username: Username;
  providerType: string;
  providerId: ProviderId;
};
