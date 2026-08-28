/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class ListCommentsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by task ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  taskId?: number;

  @ApiPropertyOptional({ description: 'Filter by project ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;
}
