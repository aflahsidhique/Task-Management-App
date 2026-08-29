/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../task.entity';

export class BulkTaskChangesDto {
  @ApiProperty({
    description: 'New status to apply',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'New priority to apply',
    enum: TaskPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'New assignee user ID to apply',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assigneeId?: number;

  @ApiProperty({ description: 'New project ID to apply', required: false })
  @IsOptional()
  @IsNumber()
  projectId?: number;
}

export class BulkUpdateTasksDto {
  @ApiProperty({ description: 'IDs of the tasks to update', type: [Number] })
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  ids: number[];

  @ApiProperty({
    description: 'Fields to apply to every selected task',
    type: BulkTaskChangesDto,
  })
  @ValidateNested()
  @Type(() => BulkTaskChangesDto)
  changes: BulkTaskChangesDto;
}
