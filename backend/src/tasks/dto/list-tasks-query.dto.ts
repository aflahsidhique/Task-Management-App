/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TaskPriority, TaskStatus } from '../task.entity';

export class ListTasksQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by project ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @ApiPropertyOptional({ description: 'Filter by assignee user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assigneeId?: number;

  @ApiPropertyOptional({ description: 'Filter by task status', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Filter by task priority', enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Only tasks assigned to the current user' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  mine?: boolean;
}
