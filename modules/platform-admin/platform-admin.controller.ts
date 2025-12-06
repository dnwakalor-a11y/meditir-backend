import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PlatformAdminService } from './platform-admin.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RbacGuard } from '../../auth/rbac.guard';
import { RequirePlatformAdmin } from '../../auth/rbac.decorators';
import { CurrentUser } from '../../auth/decorators';
import { TenantStatus } from '../tenants/tenant.entity';
import {
  CreateHospitalDto,
  UpdateHospitalDto,
  HospitalResponseDto,
  PlatformStatsDto,
  SystemConfigDto,
  UpdateSystemConfigDto,
  UserManagementDto,
  AuditLogDto,
} from './dto/platform-admin.dto';

@ApiTags('Platform Administration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@RequirePlatformAdmin()
@Controller('platform-admin')
export class PlatformAdminController {
  constructor(private platformAdminService: PlatformAdminService) {}

  // ===================== DEBUG ENDPOINT =====================

  @Get('debug/auth')
  @ApiOperation({
    summary: 'Debug authentication',
    description: 'Debug endpoint to test authentication and authorization',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auth debug info',
  })
  async debugAuth(@CurrentUser() user: any): Promise<any> {
    return {
      message: 'Authentication successful',
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ===================== DASHBOARD & ANALYTICS =====================

  @Get('dashboard/stats')
  @ApiOperation({
    summary: 'Get platform statistics',
    description:
      'Retrieve comprehensive platform analytics and statistics for dashboard',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Platform statistics retrieved successfully',
    type: PlatformStatsDto,
  })
  async getPlatformStats(): Promise<PlatformStatsDto> {
    return this.platformAdminService.getPlatformStats();
  }

  @Get('dashboard/recent-activities')
  @ApiOperation({
    summary: 'Get recent platform activities',
    description: 'Retrieve recent activities across all tenants for monitoring',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to retrieve',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recent activities retrieved successfully',
    type: [AuditLogDto],
  })
  async getRecentActivities(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<AuditLogDto[]> {
    return this.platformAdminService.getRecentActivities(limit);
  }

  // ===================== HOSPITAL/TENANT MANAGEMENT =====================

  @Get('hospitals')
  @ApiOperation({
    summary: 'Get all hospitals',
    description: 'Retrieve all hospital tenants with filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or subdomain',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospitals retrieved successfully',
    type: [HospitalResponseDto],
  })
  async getAllHospitals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<{
    hospitals: HospitalResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.platformAdminService.getAllHospitals({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      search,
    });
  }

  @Post('hospitals')
  @ApiOperation({
    summary: 'Create new hospital',
    description: 'Create a new hospital tenant with initial configuration',
  })
  @ApiBody({ type: CreateHospitalDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hospital created successfully',
    type: HospitalResponseDto,
  })
  async createHospital(
    @Body() createHospitalDto: CreateHospitalDto,
    @CurrentUser() user: any,
  ): Promise<HospitalResponseDto> {
    return this.platformAdminService.createHospital(
      createHospitalDto,
      user.userId,
    );
  }

  @Get('hospitals/:id')
  @ApiOperation({
    summary: 'Get hospital details',
    description: 'Retrieve detailed information about a specific hospital',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital details retrieved successfully',
    type: HospitalResponseDto,
  })
  async getHospitalById(@Param('id') id: string): Promise<HospitalResponseDto> {
    return this.platformAdminService.getHospitalById(id);
  }

  @Put('hospitals/:id')
  @ApiOperation({
    summary: 'Update hospital',
    description: 'Update hospital configuration and settings',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiBody({ type: UpdateHospitalDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital updated successfully',
    type: HospitalResponseDto,
  })
  async updateHospital(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ): Promise<HospitalResponseDto> {
    return this.platformAdminService.updateHospital(id, updateHospitalDto);
  }

  @Delete('hospitals/:id')
  @ApiOperation({
    summary: 'Deactivate hospital',
    description: 'Deactivate a hospital tenant (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital deactivated successfully',
  })
  async deactivateHospital(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.platformAdminService.deactivateHospital(id);
    return { message: 'Hospital deactivated successfully' };
  }

  @Post('hospitals/:id/activate')
  @ApiOperation({
    summary: 'Activate hospital',
    description: 'Reactivate a deactivated hospital tenant',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital activated successfully',
  })
  async activateHospital(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.platformAdminService.activateHospital(id);
    return { message: 'Hospital activated successfully' };
  }

  @Put('hospitals/:id/suspend')
  @ApiOperation({
    summary: 'Suspend hospital',
    description:
      'Suspend a hospital tenant (different from deactivate - temporary restriction)',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital suspended successfully',
  })
  async suspendHospital(@Param('id') id: string): Promise<{ message: string }> {
    await this.platformAdminService.suspendHospital(id);
    return { message: 'Hospital suspended successfully' };
  }

  @Get('hospitals/status/:status')
  @ApiOperation({
    summary: 'Get hospitals by status',
    description: 'Retrieve hospitals filtered by status',
  })
  @ApiParam({
    name: 'status',
    description: 'Hospital status',
    enum: ['active', 'inactive', 'suspended', 'pending'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospitals retrieved successfully',
    type: [HospitalResponseDto],
  })
  async getHospitalsByStatus(
    @Param('status') status: string,
  ): Promise<HospitalResponseDto[]> {
    return this.platformAdminService.getHospitalsByStatus(
      status as TenantStatus,
    );
  }

  @Put('hospitals/:id/status')
  @ApiOperation({
    summary: 'Update hospital status',
    description: 'Update the status of a hospital tenant',
  })
  @ApiParam({ name: 'id', description: 'Hospital ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'suspended', 'pending'],
          description: 'New status for the hospital',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital status updated successfully',
    type: HospitalResponseDto,
  })
  async updateHospitalStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<HospitalResponseDto> {
    return this.platformAdminService.updateHospitalStatus(
      id,
      status as TenantStatus,
    );
  }

  // ===================== USER MANAGEMENT ACROSS TENANTS =====================

  @Get('users')
  @ApiOperation({
    summary: 'Get all users across tenants',
    description: 'Retrieve users from all tenants with filtering and search',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Filter by tenant',
  })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or email',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: [UserManagementDto],
  })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('tenantId') tenantId?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ): Promise<{
    users: UserManagementDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.platformAdminService.getAllUsers({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      tenantId,
      role,
      search,
    });
  }

  @Put('users/:id/suspend')
  @ApiOperation({
    summary: 'Suspend user',
    description: 'Suspend a user across the platform',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User suspended successfully',
  })
  async suspendUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.platformAdminService.suspendUser(id);
    return { message: 'User suspended successfully' };
  }

  @Put('users/:id/activate')
  @ApiOperation({
    summary: 'Activate user',
    description: 'Activate a suspended user',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User activated successfully',
  })
  async activateUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.platformAdminService.activateUser(id);
    return { message: 'User activated successfully' };
  }

  // ===================== SYSTEM CONFIGURATION =====================

  @Get('system/config')
  @ApiOperation({
    summary: 'Get system configuration',
    description: 'Retrieve current system-wide configuration settings',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System configuration retrieved successfully',
    type: SystemConfigDto,
  })
  async getSystemConfig(): Promise<SystemConfigDto> {
    return this.platformAdminService.getSystemConfig();
  }

  @Put('system/config')
  @ApiOperation({
    summary: 'Update system configuration',
    description: 'Update system-wide configuration settings',
  })
  @ApiBody({ type: UpdateSystemConfigDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System configuration updated successfully',
    type: SystemConfigDto,
  })
  async updateSystemConfig(
    @Body() updateConfigDto: UpdateSystemConfigDto,
  ): Promise<SystemConfigDto> {
    return this.platformAdminService.updateSystemConfig(updateConfigDto);
  }

  @Get('system/health')
  @ApiOperation({
    summary: 'Get system health status',
    description: 'Retrieve system health metrics and status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System health status retrieved successfully',
  })
  async getSystemHealth(): Promise<{
    status: string;
    database: { status: string; responseTime: number };
    redis: { status: string; responseTime: number };
    services: Array<{ name: string; status: string; responseTime?: number }>;
    uptime: number;
    memory: { used: number; total: number; percentage: number };
  }> {
    return this.platformAdminService.getSystemHealth();
  }

  // ===================== AUDIT LOGS & MONITORING =====================

  @Get('audit-logs')
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Retrieve platform audit logs with filtering',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filter by action',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'Filter by tenant',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully',
    type: [AuditLogDto],
  })
  async getAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    logs: AuditLogDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.platformAdminService.getAuditLogs({
      page,
      limit,
      action,
      userId,
      tenantId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // ===================== REPORTS & ANALYTICS =====================

  @Get('reports/usage')
  @ApiOperation({
    summary: 'Get platform usage report',
    description: 'Generate platform usage analytics report',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Report period (day, week, month, year)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Custom start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Custom end date',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usage report generated successfully',
  })
  async getUsageReport(
    @Query('period') period: string = 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    return this.platformAdminService.getUsageReport({
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('reports/revenue')
  @ApiOperation({
    summary: 'Get revenue report',
    description: 'Generate platform revenue analytics report',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Report period' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Revenue report generated successfully',
  })
  async getRevenueReport(
    @Query('period') period: string = 'month',
  ): Promise<any> {
    return this.platformAdminService.getRevenueReport(period);
  }

  // ===================== MAINTENANCE & OPERATIONS =====================

  @Post('maintenance/start')
  @ApiOperation({
    summary: 'Start maintenance mode',
    description: 'Put the platform in maintenance mode',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Maintenance message for users',
        },
        estimatedDuration: {
          type: 'number',
          description: 'Estimated duration in minutes',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance mode started successfully',
  })
  async startMaintenance(
    @Body() body: { message?: string; estimatedDuration?: number },
  ): Promise<{ message: string }> {
    await this.platformAdminService.startMaintenance(
      body.message,
      body.estimatedDuration,
    );
    return { message: 'Maintenance mode started successfully' };
  }

  @Post('maintenance/stop')
  @ApiOperation({
    summary: 'Stop maintenance mode',
    description: 'Take the platform out of maintenance mode',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance mode stopped successfully',
  })
  async stopMaintenance(): Promise<{ message: string }> {
    await this.platformAdminService.stopMaintenance();
    return { message: 'Maintenance mode stopped successfully' };
  }

  @Post('cache/clear')
  @ApiOperation({
    summary: 'Clear application cache',
    description: 'Clear all cached data across the platform',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cache cleared successfully',
  })
  async clearCache(): Promise<{ message: string }> {
    await this.platformAdminService.clearCache();
    return { message: 'Cache cleared successfully' };
  }
}
