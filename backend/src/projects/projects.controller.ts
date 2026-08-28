/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Retrieve projects (paginated, searchable, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of projects' })
  @Get()
  getAllProjects(@Query() query: ListProjectsQueryDto) {
    return this.projectsService.getAllProjects(query);
  }

  @ApiOperation({ summary: 'Retrieve a project by ID' })
  @ApiResponse({ status: 200, description: 'Project details', type: Project })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Get(':id')
  getProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectById(id);
  }

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully', type: Project })
  @Roles('Admin', 'Project Manager')
  @RequirePermissions('manage_projects')
  @Post()
  createProject(@Body() dto: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectsService.createProject(dto, user.id);
  }

  @ApiOperation({ summary: 'Update a project by ID' })
  @ApiResponse({ status: 200, description: 'Project updated successfully', type: Project })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Roles('Admin', 'Project Manager')
  @RequirePermissions('manage_projects')
  @Put(':id')
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.updateProject(id, dto, user.id);
  }

  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Roles('Admin')
  @RequirePermissions('manage_projects')
  @Delete(':id')
  deleteProject(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectsService.deleteProject(id);
  }

  @ApiOperation({ summary: 'Add a member to a project' })
  @Roles('Admin', 'Project Manager')
  @RequirePermissions('manage_projects')
  @Post(':id/members')
  addMember(@Param('id', ParseIntPipe) id: number, @Body() dto: AddMemberDto) {
    return this.projectsService.addMember(id, dto.userId);
  }

  @ApiOperation({ summary: 'Remove a member from a project' })
  @Roles('Admin', 'Project Manager')
  @RequirePermissions('manage_projects')
  @Delete(':id/members/:userId')
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectsService.removeMember(id, userId);
  }
}
