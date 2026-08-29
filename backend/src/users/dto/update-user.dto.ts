/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserStatus } from '../user.entity';

export class UpdateUserDto {
  @ApiProperty({ description: 'Full name of the user', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'Email address of the user', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Job title of the user', required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ description: 'Avatar URL of the user', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ description: 'Mobile number of the user', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({
    description: 'ID of the role assigned to the user',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  roleId?: number;

  @ApiProperty({
    description: 'Account status',
    enum: UserStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
