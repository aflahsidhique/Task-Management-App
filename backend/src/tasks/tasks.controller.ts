/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { BulkUpdateTasksDto } from './dto/bulk-update-tasks.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { User } from '../users/user.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({
    summary: 'Retrieve tasks (paginated, searchable, filterable)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of tasks' })
  @Get()
  getAllTasks(@Query() query: ListTasksQueryDto, @CurrentUser() user?: User) {
    return this.tasksService.getAllTasks(query, user?.id);
  }

  @ApiOperation({ summary: 'Update multiple tasks at once' })
  @ApiResponse({
    status: 200,
    description: 'Tasks updated successfully',
    type: [Task],
  })
  @RequirePermissions('manage_tasks')
  @Patch('bulk')
  bulkUpdateTasks(
    @Body() dto: BulkUpdateTasksDto,
    @CurrentUser() user: User,
  ): Promise<Task[]> {
    return this.tasksService.bulkUpdateTasks(dto, user);
  }

  @ApiOperation({ summary: 'Retrieve a task by ID' })
  @ApiResponse({ status: 200, description: 'Task details', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Get(':id')
  getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: Task,
  })
  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto, user.id);
  }

  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Put(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateTask(id, updateTaskDto, user);
  }

  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Delete(':id')
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }
}
