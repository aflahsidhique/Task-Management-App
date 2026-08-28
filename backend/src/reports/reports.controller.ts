/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Task completion breakdown grouped by project' })
  @Get('by-project')
  byProject(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.byProject(from, to);
  }

  @ApiOperation({ summary: 'Task completion breakdown grouped by user' })
  @Get('by-user')
  byUser(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.byUser(from, to);
  }

  @ApiOperation({ summary: 'Task count breakdown grouped by status' })
  @Get('by-status')
  byStatus(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.byStatus(from, to);
  }
}
