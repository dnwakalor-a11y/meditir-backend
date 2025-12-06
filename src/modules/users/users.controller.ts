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
  Query,
  ForbiddenException,
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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserResponseDto,
  UsersListResponseDto,
  UserProfileDto,
  UpdateUserProfileDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RbacGuard } from '../../auth/rbac.guard';
import { CurrentTenant, CurrentUser } from '../../auth/decorators';
import {
  RequirePermissions,
  RequireTenantAdmin,
  RequireResourceOwnership,
} from '../../auth/rbac.decorators';
import { UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user account. Only admins can create users.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or email already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - admin required',
  })
  @RequirePermissions('create:users')
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<UserResponseDto> {
    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const { password, ...userDataWithoutPassword } = createUserDto;
    const userData = {
      ...userDataWithoutPassword,
      passwordHash,
      tenantId,
    };

    return this.usersService.create(userData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve all users in the current tenant. Only admins can view all users.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role',
    enum: UserRole,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: UsersListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - admin required',
  })
  @RequirePermissions('read:users')
  async findAll(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: UserRole,
  ): Promise<UsersListResponseDto> {
    // Platform admins can see users from all tenants, others only from their tenant
    const filterTenantId =
      user.role === UserRole.PLATFORM_ADMIN ? undefined : tenantId;

    const users = await this.usersService.findByTenant(filterTenantId, {
      page,
      limit,
      role,
    });

    return {
      users,
      total: users.length, // TODO: Implement proper pagination count
      page: Number(page),
      limit: Number(limit),
    };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: "Retrieve the current user's profile information",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getCurrentUser(@CurrentUser() user: any): Promise<UserResponseDto> {
    const fullUser = await this.usersService.findById(user.userId);
    if (!fullUser) {
      throw new NotFoundException('User not found');
    }
    return fullUser;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieve a specific user by ID. Admins can view any user, others can only view their own profile.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<UserResponseDto> {
    // Users can view their own profile, admins can view any user in their tenant
    const canView =
      user.userId === id ||
      [UserRole.ADMIN, UserRole.PLATFORM_ADMIN].includes(user.role);

    if (!canView) {
      throw new ForbiddenException('Access denied');
    }

    const targetUser = await this.usersService.findById(id);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Non-platform admins can only view users from their tenant
    if (
      user.role !== UserRole.PLATFORM_ADMIN &&
      targetUser.tenantId !== tenantId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return targetUser;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Update user information. Users can update their own profile, admins can update any user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<UserResponseDto> {
    // Users can update their own profile, admins can update any user in their tenant
    const canUpdate =
      user.userId === id ||
      [UserRole.ADMIN, UserRole.PLATFORM_ADMIN].includes(user.role);

    if (!canUpdate) {
      throw new ForbiddenException('Access denied');
    }

    const targetUser = await this.usersService.findById(id);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Non-platform admins can only update users from their tenant
    if (
      user.role !== UserRole.PLATFORM_ADMIN &&
      targetUser.tenantId !== tenantId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/password')
  @ApiOperation({
    summary: 'Change user password',
    description:
      "Change user password. Users can change their own password, admins can change any user's password.",
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    format: 'uuid',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Password change data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password changed successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid current password',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<{ message: string }> {
    // Users can change their own password, admins can change any user's password
    const canChange =
      user.userId === id ||
      [UserRole.ADMIN, UserRole.PLATFORM_ADMIN].includes(user.role);

    if (!canChange) {
      throw new ForbiddenException('Access denied');
    }

    const targetUser = await this.usersService.findById(id);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Non-platform admins can only change passwords for users from their tenant
    if (
      user.role !== UserRole.PLATFORM_ADMIN &&
      targetUser.tenantId !== tenantId
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Verify current password (only for self-password change)
    if (user.userId === id) {
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        targetUser.passwordHash,
      );
      if (!isCurrentPasswordValid) {
        throw new ForbiddenException('Invalid current password');
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    await this.usersService.update(id, { passwordHash: newPasswordHash });

    return { message: 'Password changed successfully' };
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieve the complete profile of the currently authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getCurrentUserProfile(
    @CurrentUser() user: any,
  ): Promise<UserProfileDto> {
    const userProfile = await this.usersService.findByIdWithRelations(
      user.userId,
    );
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }
    return this.formatUserProfile(userProfile);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Update the profile information of the currently authenticated user',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async updateCurrentUserProfile(
    @CurrentUser() user: any,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const updatedUser = await this.usersService.update(
      user.userId,
      updateUserProfileDto,
    );
    return this.formatUserProfile(updatedUser);
  }

  private formatUserProfile(user: any): UserProfileDto {
    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      profileData: user.profileData,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tenant: user.tenant
        ? {
            tenantId: user.tenant.tenantId,
            name: user.tenant.name,
            subdomain: user.tenant.subdomain,
          }
        : undefined,
      provider: user.provider
        ? {
            providerId: user.provider.providerId,
            specialization: user.provider.specialization,
            licenseNumber: user.provider.licenseNumber,
            qualifications: user.provider.qualifications,
            isActive: user.provider.isActive,
          }
        : undefined,
      patient: user.patient
        ? {
            patientId: user.patient.patientId,
            medicalRecordNumber: user.patient.medicalRecordNumber,
            dateOfBirth: user.patient.dateOfBirth,
            gender: user.patient.gender,
            phoneNumber: user.patient.phoneNumber,
            address: user.patient.address,
          }
        : undefined,
    };
  }
}
