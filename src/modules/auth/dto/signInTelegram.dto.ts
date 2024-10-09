import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

import { B } from '~/infrastructure/database';

export class SignInTelegramDto {
  @ApiProperty({ example: 12390809, type: 'number' })
  @Transform(({ value }) => value.toString())
  @IsString()
  auth: B.ProviderUserId;
}
