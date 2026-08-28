/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Comment body' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'IDs of users @mentioned in this comment',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  mentionedUserIds?: number[];
}
