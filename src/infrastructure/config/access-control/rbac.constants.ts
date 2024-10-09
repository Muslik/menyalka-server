export enum Role {
  Banned = 'banned',
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
}

export enum RoleId {
  Banned = 0,
  User = 1,
  Moderator = 2,
  Admin = 3,
}

export enum Permission {
  AccessControlManage = 'ACCESS_CONTROL_MANAGE',
}

export enum PermissionId {
  AccessControlManage = 1,
}

export type Roles = Record<Role, { id: RoleId; name: Role }>;

export const ROLES_MAP = {
  [Role.Banned]: { id: RoleId.Banned, name: Role.Banned },
  [Role.User]: { id: RoleId.User, name: Role.User },
  [Role.Admin]: { id: RoleId.Admin, name: Role.Admin },
  [Role.Moderator]: { id: RoleId.Moderator, name: Role.Moderator },
} satisfies Roles;

export const ROLES = Object.values(ROLES_MAP);

export type Permissions = Record<Permission, { id: PermissionId; name: Permission }>;

export const PERMISSIONS: Permissions = {
  [Permission.AccessControlManage]: { id: PermissionId.AccessControlManage, name: Permission.AccessControlManage },
} satisfies Permissions;

export const ROLES_PERMISSIONS = new Map()
  .set([Role.User], [])
  .set([Role.Moderator], [])
  .set([Role.Admin], [PermissionId.AccessControlManage]);
