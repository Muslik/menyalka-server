import { Brand } from 'effect';

export type RoleId = number & Brand.Brand<'RoleId'>;
export const RoleId = Brand.nominal<RoleId>();

export type UserId = number & Brand.Brand<'UserId'>;
export const UserId = Brand.nominal<UserId>();

export type PermissionId = number & Brand.Brand<'PermissionId'>;
export const PermissionId = Brand.nominal<PermissionId>();

export type ProviderUserId = string & Brand.Brand<'ProviderUserId'>;
export const ProviderUserId = Brand.nominal<ProviderUserId>();

export type Email = string & Brand.Brand<'Email'>;
export const Email = Brand.nominal<Email>();

export type Username = string & Brand.Brand<'Username'>;
export const Username = Brand.nominal<Username>();
