import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsBoolean } from 'class-validator';

import { IsEmailFree, IsUsernameFree } from '~/modules/user';

export class SignUpDto {
  @ApiProperty({ example: '@Dzhabb' })
  @IsString()
  @IsNotEmpty()
  @IsUsernameFree()
  username: string;

  @ApiProperty({ example: 'Dzhabb@mail.ru' })
  @IsEmail()
  @IsEmailFree()
  email: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  sex: boolean;

  @ApiProperty({ example: 'I am a cool guy' })
  @IsString()
  description: string;
}
