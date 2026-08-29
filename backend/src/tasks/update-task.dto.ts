/* eslint-disable prettier/prettier */
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskPriority, TaskStatus } from './task.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({ description: 'Title of the task', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Description of the task', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Status of the task',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Priority of the task',
    enum: TaskPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ description: 'Due date of the task', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'ID of the project this task belongs to',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  projectId?: number;

  @ApiProperty({
    description: 'ID of the user this task is assigned to',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  assigneeId?: number;

  @ApiProperty({
    description: 'Estimated hours to complete the task',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiProperty({
    description: 'Actual hours spent on the task',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  actualHours?: number;
}
