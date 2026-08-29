/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProjectStatus } from '../project.entity';

export class CreateProjectDto {
  @ApiProperty({ description: 'Name of the project' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the project', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Status of the project',
    enum: ProjectStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ description: 'Start date of the project' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the project' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'ID of the project owner' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({
    description: 'IDs of the project members',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  memberIds?: number[];
}
