const ROLE_NAME = {
  banned: 'banned',
  user: 'user',
  moderator: 'moderator',
  admin: 'admin',
} as const;

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

export type Roles = Record<RoleId, { id: RoleId; name: Values<typeof ROLE_NAME> }>;

export const ROLES_MAP = {
  [RoleId.Banned]: { id: RoleId.Banned, name: ROLE_NAME.banned },
  [RoleId.User]: { id: RoleId.User, name: ROLE_NAME.user },
  [RoleId.Admin]: { id: RoleId.Admin, name: ROLE_NAME.admin },
  [RoleId.Moderator]: { id: RoleId.Moderator, name: ROLE_NAME.moderator },
} satisfies Roles;

export const ROLES = Object.values(ROLES_MAP);

export type Permissions = Record<Permission, { id: PermissionId; name: Permission; description: string }>;

export const PERMISSIONS: Permissions = {
  [Permission.AccessControlManage]: {
    id: PermissionId.AccessControlManage,
    name: Permission.AccessControlManage,
    description: 'Allows managing access control settings, including roles and permissions for users.',
  },
} satisfies Permissions;

export const ROLES_PERMISSIONS = {
  [RoleId.Banned]: [] as PermissionId[],
  [RoleId.User]: [] as PermissionId[],
  [RoleId.Moderator]: [] as PermissionId[],
  [RoleId.Admin]: [PermissionId.AccessControlManage],
} satisfies Record<RoleId, PermissionId[]>;
