/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment body' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID of the task this comment belongs to',
    required: false,
  })
  @IsOptional()
  @IsInt()
  taskId?: number;

  @ApiProperty({
    description: 'ID of the project this comment belongs to',
    required: false,
  })
  @IsOptional()
  @IsInt()
  projectId?: number;

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
