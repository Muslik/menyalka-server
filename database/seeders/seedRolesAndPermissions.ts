import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';

import { RBAC } from '~/config';
import { schema } from '~/libs/database';
import { RoleId, PermissionId } from '~/libs/database/drizzle/brands';
import { typedEntries } from '~/libs/typedObject';

export async function seedRolesAndPermissions(db: ReturnType<typeof drizzle<typeof schema>>) {
  console.log('Seeding roles and permissions...');
  try {
    const existingRoles = await db.query.roles.findMany();
    const existingPermissions = await db.query.permissions.findMany();

    const rolesToDelete = existingRoles.filter((role) => !RBAC.ROLES_MAP[role.id as RBAC.RoleId]);
    const rolesToInsertOrUpdate = Object.values(RBAC.ROLES_MAP);

    const permissionsToDelete = existingPermissions.filter(
      (permission) => !RBAC.PERMISSIONS[permission.name as RBAC.Permission],
    );
    const permissionsToInsertOrUpdate = Object.values(RBAC.PERMISSIONS);

    await db.transaction(async (tx) => {
      for (const role of rolesToDelete) {
        console.log('Deleting role:', role.name);
        await tx.delete(schema.roles).where(eq(schema.roles.id, role.id));
      }
      for (const permission of permissionsToDelete) {
        console.log('Deleting permission:', permission.name);
        await tx.delete(schema.permissions).where(eq(schema.permissions.id, permission.id));
      }

      for (const role of rolesToInsertOrUpdate) {
        const existingRole = existingRoles.find((r) => r.id === role.id);
        if (existingRole) {
          if (existingRole.name !== role.name) {
            console.log('Updating role:', role.name);
            await tx
              .update(schema.roles)
              .set({ name: role.name })
              .where(eq(schema.roles.id, RoleId(role.id)));
          }
        } else {
          console.log('Inserting role:', role.name);
          await tx.insert(schema.roles).values({
            id: RoleId(role.id),
            name: role.name,
          });
        }
      }

      for (const permission of permissionsToInsertOrUpdate) {
        const existingPermission = existingPermissions.find((p) => p.id === permission.id);
        if (existingPermission) {
          if (
            existingPermission.name !== permission.name ||
            existingPermission.description !== permission.description
          ) {
            console.log('Updating permission:', permission.name);
            await tx
              .update(schema.permissions)
              .set({ name: permission.name, description: permission.description })
              .where(eq(schema.permissions.id, PermissionId(permission.id)));
          }
        } else {
          console.log('Inserting permission:', permission.name);
          await tx.insert(schema.permissions).values({
            id: PermissionId(permission.id),
            name: permission.name,
            description: permission.description,
          });
        }
      }

      const existingRolePermissions = await tx.query.rolesToPermissions.findMany();

      for (const entries of typedEntries(RBAC.ROLES_PERMISSIONS)) {
        const roleId = Number(entries[0]);
        const permissionIds = entries[1].map(Number);
        const existingPermissionsForRole = existingRolePermissions.filter((rp) => rp.roleId === roleId);
        for (const rp of existingPermissionsForRole) {
          if (!permissionIds.includes(rp.permissionId)) {
            console.log('Deleting role permission:', roleId, rp.permissionId);
            await tx
              .delete(schema.rolesToPermissions)
              .where(
                and(
                  eq(schema.rolesToPermissions.roleId, rp.roleId),
                  eq(schema.rolesToPermissions.permissionId, rp.permissionId),
                ),
              );
          }
        }

        for (const permissionId of permissionIds) {
          const exists = existingRolePermissions.some((rp) => rp.roleId === roleId && rp.permissionId === permissionId);
          if (!exists) {
            console.log('Inserting role permission:', roleId, permissionId);
            await tx.insert(schema.rolesToPermissions).values({
              roleId: RoleId(roleId),
              permissionId: PermissionId(permissionId),
            });
          }
        }
      }
    });
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding roles and permissions:', error);
    throw error;
  }
}
