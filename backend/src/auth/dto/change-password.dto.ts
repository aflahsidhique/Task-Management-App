/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password of the user' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'New password of the user' })
  @MinLength(8)
  newPassword: string;
}
