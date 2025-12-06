import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { RoleType } from './role.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RbacGuard } from '../../auth/rbac.guard';
import { RequirePlatformAdmin, RequireTenantAdmin } from '../../auth/rbac.decorators';
import { CurrentUser, CurrentTenant } from '../../auth/decorators';
import { CreateRoleDto, AssignRoleDto, RoleResponseDto } from './dto/rbac.dto';

@ApiTags('RBAC - Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('rbac')
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Get('permissions')
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Retrieve all available permissions in the system',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions retrieved successfully',
  })
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('roles')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Get tenant roles',
    description: 'Retrieve all roles available for the current tenant',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
    type: [RoleResponseDto],
  })
  async getTenantRoles(@CurrentTenant() tenantId: string) {
    return this.rbacService.getTenantRoles(tenantId);
  }

  @Post('roles')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Create custom role',
    description: 'Create a new custom role for the tenant',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.rbacService.createRole({
      ...createRoleDto,
      tenantId,
      type: RoleType.CUSTOM,
    });
  }

  @Post('users/:userId/roles')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Assign role to user',
    description: 'Assign a role to a user within the tenant',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role assigned successfully',
  })
  async assignRole(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.rbacService.assignRole(
      userId,
      assignRoleDto.roleId,
      user.userId,
      assignRoleDto.expiresAt,
    );
  }

  @Delete('users/:userId/roles/:roleId')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Remove role from user',
    description: 'Remove a role assignment from a user',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role removed successfully',
  })
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rbacService.removeRole(userId, roleId);
  }

  @Get('users/:userId/permissions')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Get user permissions',
    description: 'Retrieve all permissions for a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User permissions retrieved successfully',
  })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }

  @Get('users/:userId/roles')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Get user roles',
    description: 'Retrieve all roles assigned to a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User roles retrieved successfully',
  })
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  @Post('roles/:roleId/permissions')
  @RequirePlatformAdmin()
  @ApiOperation({
    summary: 'Add permissions to role',
    description: 'Add permissions to an existing role. Platform admin only.',
  })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of permission IDs to add',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions added to role successfully',
  })
  async addPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] },
  ) {
    return this.rbacService.addPermissionsToRole(roleId, body.permissionIds);
  }
}
