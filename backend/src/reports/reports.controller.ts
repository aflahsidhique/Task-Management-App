/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@RequirePermissions('view_reports')
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

  @ApiOperation({ summary: 'Project progress report (completion % and overdue tasks per project)' })
  @Get('project-progress')
  projectProgress() {
    return this.reportsService.projectProgress();
  }

  @ApiOperation({ summary: 'User productivity report (workload, completion rate, on-time rate)' })
  @Get('user-productivity')
  userProductivity(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.userProductivity(from, to);
  }

  @ApiOperation({ summary: 'Daily created-vs-completed task trend' })
  @Get('task-completion-trend')
  taskCompletionTrend(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.taskCompletionTrend(from, to);
  }

  @ApiOperation({ summary: 'Paginated list of currently overdue tasks' })
  @Get('overdue-tasks')
  overdueTasks(@Query() query: PaginationQueryDto) {
    return this.reportsService.overdueTasks(query);
  }
}
