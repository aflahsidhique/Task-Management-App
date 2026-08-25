/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { Activity } from './activity.entity';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiOperation({ summary: 'Retrieve recent activities' })
  @ApiResponse({ status: 200, description: 'List of recent activities', type: [Activity] })
  @Get()
  getRecent(@Query('limit') limit?: string): Promise<Activity[]> {
    return this.activitiesService.getRecent(limit ? parseInt(limit, 10) : 20);
  }
}
