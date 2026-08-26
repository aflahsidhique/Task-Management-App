/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: 'ID of the user to add as a member' })
  @IsNumber()
  userId: number;
}
