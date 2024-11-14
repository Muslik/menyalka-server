import { ApiProperty } from '@nestjs/swagger';

import { RBAC } from '~/config';
import { UserId } from '~/libs/database';
import { Sex } from '~/modules/user';

export class UserAuthDto {
  @ApiProperty({ example: 1, type: Number })
  id: UserId;

  @ApiProperty({ example: 'johny' })
  username: string;

  @ApiProperty({ enum: RBAC.Permission, example: [RBAC.Permission.AccessControlManage], isArray: true })
  permissions: RBAC.Permission[];

  @ApiProperty({ type: String, example: 'John', nullable: true })
  description: string | null;

  @ApiProperty({ enumName: 'sex', example: Sex.Male, enum: Sex })
  sex: Sex;
}
