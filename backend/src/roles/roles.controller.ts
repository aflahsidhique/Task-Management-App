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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Retrieve all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles', type: [Role] })
  @Get()
  getAllRoles(): Promise<Role[]> {
    return this.rolesService.getAllRoles();
  }

  @ApiOperation({ summary: 'Retrieve a role by ID' })
  @ApiResponse({ status: 200, description: 'Role details', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Get(':id')
  getRoleById(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.rolesService.getRoleById(id);
  }

  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: Role,
  })
  @Roles('Admin')
  @RequirePermissions('manage_roles')
  @Post()
  createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(createRoleDto);
  }

  @ApiOperation({ summary: 'Update a role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: Role,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Roles('Admin')
  @RequirePermissions('manage_roles')
  @Put(':id')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete a role by ID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Roles('Admin')
  @RequirePermissions('manage_roles')
  @Delete(':id')
  deleteRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.deleteRole(id);
  }
}
