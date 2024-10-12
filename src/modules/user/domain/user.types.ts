import { SocialCredentialEntity } from './entities/social-credential.entity';
import { Description } from './value-objects/description.value-object';
import { Email } from './value-objects/email.value-object';
import { Sex, SexEnum } from './value-objects/sex.value-object';
import { Username } from './value-objects/username.value-object';

export interface UserProps {
  username: Username;
  email: Email | null;
  description: Description;
  sex: Sex;
  role: UserRoles;
  socialCredentials: SocialCredentialEntity[];
}

export enum UserRoles {
  Admin = 'admin',
  User = 'user',
  Moderator = 'moderator',
  Banned = 'banned',
}

export interface CreateUserProps {
  username: Username;
  email?: Email;
  description?: Description;
  sex?: Sex;
}

export interface UpdateUserProps {
  email?: string | null;
  description?: string;
  sex?: SexEnum;
}
