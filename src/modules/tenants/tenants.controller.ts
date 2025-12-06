import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantResponseDto,
} from './dto/tenant.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../auth/decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tenant',
    description:
      'Create a new hospital/clinic tenant. Only platform admins can create tenants.',
  })
  @ApiBody({
    type: CreateTenantDto,
    description: 'Tenant creation details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant created successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or subdomain already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Subdomain already exists' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - platform admin required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Access denied' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: any,
  ): Promise<TenantResponseDto> {
    // Only platform admins can create tenants
    if (user.role !== UserRole.PLATFORM_ADMIN) {
      throw new NotFoundException('Access denied');
    }
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tenants',
    description:
      'Retrieve all tenants. Only platform admins can view all tenants.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenants retrieved successfully',
    type: [TenantResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - platform admin required',
  })
  async findAll(@CurrentUser() user: any): Promise<TenantResponseDto[]> {
    // Only platform admins can view all tenants
    if (user.role !== UserRole.PLATFORM_ADMIN) {
      throw new NotFoundException('Access denied');
    }
    return this.tenantsService.findAll();
  }

  @Get('current')
  @ApiOperation({
    summary: 'Get current tenant',
    description: "Retrieve the current user's tenant information",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current tenant retrieved successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Tenant not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getCurrentTenant(
    @CurrentTenant() tenantId: string,
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantsService.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  @Put('current')
  @ApiOperation({
    summary: 'Update current tenant',
    description: 'Update the current tenant settings. Only tenant admins can update their own tenant.',
  })
  @ApiBody({
    type: UpdateTenantDto,
    description: 'Tenant update data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - Only tenant admins can update their tenant',
  })
  async updateCurrentTenant(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    // Only tenant admins and platform admins can update tenant settings
    const canUpdate =
      user.role === UserRole.PLATFORM_ADMIN ||
      user.role === UserRole.ADMIN;

    if (!canUpdate) {
      throw new NotFoundException('Access denied - Only tenant admins can update their tenant');
    }

    return this.tenantsService.update(tenantId, updateTenantDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get tenant by ID',
    description:
      'Retrieve a specific tenant by ID. Platform admins can view any tenant, others can only view their own.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tenant UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant retrieved successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() currentTenantId: string,
  ): Promise<TenantResponseDto> {
    // Platform admins can view any tenant, others can only view their own
    if (user.role !== UserRole.PLATFORM_ADMIN && id !== currentTenantId) {
      throw new NotFoundException('Access denied');
    }

    const tenant = await this.tenantsService.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update tenant',
    description:
      'Update tenant information. Platform admins can update any tenant, tenant admins can update their own.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tenant UUID',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateTenantDto,
    description: 'Tenant update data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant updated successfully',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: any,
    @CurrentTenant() currentTenantId: string,
  ): Promise<TenantResponseDto> {
    // Platform admins can update any tenant, tenant admins can update their own
    const canUpdate =
      user.role === UserRole.PLATFORM_ADMIN ||
      (user.role === UserRole.ADMIN && id === currentTenantId);

    if (!canUpdate) {
      throw new NotFoundException('Access denied');
    }

    return this.tenantsService.update(id, updateTenantDto);
  }
}
