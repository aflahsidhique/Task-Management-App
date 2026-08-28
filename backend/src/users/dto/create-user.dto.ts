/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the user account' })
  @MinLength(8)
  password: string;

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

  @ApiProperty({ description: 'ID of the role assigned to the user' })
  @IsNumber()
  roleId: number;
}
