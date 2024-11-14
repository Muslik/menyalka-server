import { it } from '@effect/vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Effect, Exit } from 'effect';
import { ClsModule } from 'nestjs-cls';

import { RBAC } from '~/config';
import { PermissionId, RoleId } from '~/libs/database';

import { ROLE_REPOSITORY } from '../access-control.constants';
import { ReadOnlyRoleError } from '../access-control.errors';
import { IRoleRepository } from '../repositories/role.repository.interface';
import { AccessControlService } from './access-control.service';

const mockRepository = {
  getRoleById: vitest.fn(),
  createRoles: vitest.fn(),
  deleteRole: vitest.fn(),
  assignPermissionToRole: vitest.fn(),
  unassignPermissionFromRole: vitest.fn(),
} satisfies IRoleRepository;

const NON_READ_ONLY_ROLE_ID = RoleId(-1);
const NON_READ_ONLY_PERMISSION_ID = PermissionId(-1);

describe('Access control service', () => {
  let accessControlService: AccessControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModule],
      providers: [
        {
          provide: ROLE_REPOSITORY,
          useValue: mockRepository,
        },
        AccessControlService,
      ],
    }).compile();

    accessControlService = module.get<AccessControlService>(AccessControlService);
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  describe('Create role', () => {
    it.effect('Should create new role', () =>
      Effect.gen(function* () {
        const mockRole = { id: 1, name: 'Super Admin' };
        mockRepository.createRoles.mockReturnValueOnce(Effect.succeed([mockRole]));

        const result = yield* accessControlService.createRole({ name: 'Super Admin' }).pipe(Effect.exit);

        expect(mockRepository.createRoles).toHaveBeenCalledWith([{ name: 'Super Admin' }]);
        expect(result).toStrictEqual(Exit.succeed(mockRole));
      }),
    );
  });

  describe('Delete role', () => {
    it.effect('Should delete role', () =>
      Effect.gen(function* () {
        mockRepository.deleteRole.mockReturnValueOnce(Effect.succeed(undefined));

        const result = yield* accessControlService.deleteRole(NON_READ_ONLY_ROLE_ID).pipe(Effect.exit);

        expect(mockRepository.deleteRole).toHaveBeenCalledWith(NON_READ_ONLY_ROLE_ID);
        expect(result).toStrictEqual(Exit.succeed(undefined));
      }),
    );

    it.effect('Should return an error if trying to delete read-only role', () =>
      Effect.gen(function* () {
        mockRepository.deleteRole.mockReturnValueOnce(Effect.succeed(undefined));

        const result = yield* accessControlService.deleteRole(RoleId(RBAC.RoleId.User)).pipe(Effect.exit);

        expect(mockRepository.deleteRole).not.toHaveBeenCalled();
        expect(result).toStrictEqual(Exit.fail(new ReadOnlyRoleError()));
      }),
    );
  });

  describe('Assign permission to role', () => {
    it.effect('Should assign permission to role', () =>
      Effect.gen(function* () {
        mockRepository.assignPermissionToRole.mockReturnValueOnce(Effect.succeed(undefined));

        const result = yield* accessControlService
          .assignPermissionToRole(NON_READ_ONLY_ROLE_ID, NON_READ_ONLY_PERMISSION_ID)
          .pipe(Effect.exit);

        expect(mockRepository.assignPermissionToRole).toHaveBeenCalledWith(
          NON_READ_ONLY_ROLE_ID,
          NON_READ_ONLY_PERMISSION_ID,
        );
        expect(result).toStrictEqual(Exit.succeed(undefined));
      }),
    );

    it.effect('Should return an error if role is read-only', () =>
      Effect.gen(function* () {
        mockRepository.assignPermissionToRole.mockReturnValueOnce(Effect.succeed(undefined));

        const result = yield* accessControlService
          .assignPermissionToRole(RoleId(RBAC.RoleId.User), PermissionId(2))
          .pipe(Effect.exit);

        expect(mockRepository.assignPermissionToRole).not.toHaveBeenCalled();
        expect(result).toStrictEqual(Exit.fail(new ReadOnlyRoleError()));
      }),
    );
  });

  describe('Unassign permission from role', () => {
    it.effect('Should unassign permission from role', () =>
      Effect.gen(function* () {
        mockRepository.unassignPermissionFromRole.mockReturnValueOnce(Effect.succeed(undefined));

        const result = yield* accessControlService
          .unassignPermissionFromRole(NON_READ_ONLY_ROLE_ID, NON_READ_ONLY_PERMISSION_ID)
          .pipe(Effect.exit);

        expect(mockRepository.unassignPermissionFromRole).toHaveBeenCalledWith(
          NON_READ_ONLY_ROLE_ID,
          NON_READ_ONLY_PERMISSION_ID,
        );
        expect(result).toStrictEqual(Exit.succeed(undefined));
      }),
    );

    it.effect('Should return an error if role is read-only', () =>
      Effect.gen(function* () {
        mockRepository.unassignPermissionFromRole.mockReturnValueOnce(Effect.succeed(undefined));

        const result = yield* accessControlService
          .unassignPermissionFromRole(RoleId(RBAC.RoleId.User), PermissionId(2))
          .pipe(Effect.exit);

        expect(mockRepository.unassignPermissionFromRole).not.toHaveBeenCalled();
        expect(result).toStrictEqual(Exit.fail(new ReadOnlyRoleError()));
      }),
    );
  });
});
