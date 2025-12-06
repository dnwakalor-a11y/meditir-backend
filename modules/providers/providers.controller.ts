import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { TenantsService } from '../tenants/tenants.service';
import { AuthService } from '../../auth/auth.service';
import { CreateProviderDto, UpdateProviderDto } from './dto/provider.dto';
import {
  CreateDoctorDto,
  BulkCreateDoctorsDto,
  DoctorResponseDto,
  BulkCreateDoctorsResponseDto,
  DoctorsListResponseDto,
  Gender,
} from './dto/doctor.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RbacGuard } from '../../auth/rbac.guard';
import { RequireTenantAdmin } from '../../auth/rbac.decorators';
import { UserRole } from '../users/user.entity';
import * as crypto from 'crypto';

@ApiTags('Providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly tenantsService: TenantsService,
    private readonly authService: AuthService,
  ) {}

  // Hospital Admin Endpoints for Doctor Management

  @Post('hospital-admin/single')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Create a single doctor (Hospital Admin)',
    description:
      'Hospital admin can create a doctor with complete user account setup',
  })
  @ApiResponse({
    status: 201,
    description: 'Doctor created successfully',
    type: DoctorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async createDoctorForHospital(
    @Body() createDoctorDto: CreateDoctorDto,
    @Request() req: any,
  ): Promise<DoctorResponseDto> {
    const tenantId = req.user.tenantId;

    try {
      // Check if user with email already exists
      const existingUser = await this.usersService.findByEmail(
        createDoctorDto.email,
      );
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Create user account - handle both invitation-based and password-based creation
      const userData: any = {
        email: createDoctorDto.email,
        firstName: createDoctorDto.firstName,
        lastName: createDoctorDto.lastName,
        role: UserRole.DOCTOR,
        tenantId: tenantId,
      };

      // If password is provided (backward compatibility), hash it and activate account
      if (createDoctorDto.password) {
        userData.passwordHash = crypto
          .createHash('sha256')
          .update(createDoctorDto.password)
          .digest('hex');
        userData.status = 'active';
        userData.isEmailVerified = true;
        userData.emailVerifiedAt = new Date();
      } else {
        // Invitation-based creation - no password yet
        userData.passwordHash = null;
        userData.status = 'inactive';
        userData.isEmailVerified = false;
        userData.emailVerifiedAt = null;
      }

      const user = await this.usersService.create(userData);

      // Create provider profile
      const providerData = {
        userId: user.userId,
        tenantId: tenantId,
        specialization: createDoctorDto.specialization,
        licenseNumber: createDoctorDto.licenseNumber,
        qualifications: createDoctorDto.qualifications,
        availability: createDoctorDto.availability,
      };

      const provider = await this.providersService.create(providerData);

      // Get hospital information for the email
      const tenant = await this.tenantsService.findById(tenantId);
      const hospitalName = tenant?.name || 'Hospital';

      // Get the admin who created this doctor
      const adminUser = await this.usersService.findById(req.user.userId);
      const invitedByName = adminUser
        ? `${adminUser.firstName} ${adminUser.lastName}`
        : 'Hospital Admin';

      try {
        if (createDoctorDto.password) {
          // Backward compatibility: password was provided, send simple welcome email
          await this.emailService.sendUserInviteEmail({
            hospitalName,
            userFirstName: createDoctorDto.firstName,
            userLastName: createDoctorDto.lastName,
            userEmail: createDoctorDto.email,
            role: 'Doctor',
            temporaryPassword: createDoctorDto.password,
            resetPasswordUrl: '', // Not needed for password-based creation
            invitedByName,
          });
        } else {
          // Invitation-based: generate password reset token and send invitation
          await this.authService.requestPasswordReset(
            createDoctorDto.email,
            tenant?.subdomain,
          );
        }
      } catch (emailError) {
        // Log email error but don't fail the doctor creation
        console.error('Failed to send invitation email:', emailError);
      }

      return {
        providerId: provider.providerId,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: UserRole.DOCTOR,
        specialization: provider.specialization,
        licenseNumber: provider.licenseNumber,
        qualifications: provider.qualifications,
        availability: provider.availability,
        isActive: true,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create doctor: ' + error.message,
      );
    }
  }

  @Post('hospital-admin/bulk')
  @ApiOperation({
    summary: 'Create multiple doctors in bulk (Hospital Admin)',
    description:
      'Hospital admin can create multiple doctors at once with complete user account setup',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk doctor creation completed',
    type: BulkCreateDoctorsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid data',
  })
  async bulkCreateDoctorsForHospital(
    @Body() bulkCreateDto: BulkCreateDoctorsDto,
    @Request() req: any,
  ): Promise<BulkCreateDoctorsResponseDto> {
    const tenantId = req.user.tenantId;
    const successful: DoctorResponseDto[] = [];
    const failed: Array<{ index: number; email: string; error: string }> = [];

    // Get hospital and admin info once for all emails
    const tenant = await this.tenantsService.findById(tenantId);
    const adminUser = await this.usersService.findById(req.user.userId);
    const hospitalName = tenant?.name || 'Hospital';
    const invitedByName = adminUser
      ? `${adminUser.firstName} ${adminUser.lastName}`
      : 'Hospital Admin';
    const baseUrl = 'http://localhost:3001';

    for (let i = 0; i < bulkCreateDto.doctors.length; i++) {
      const doctorDto = bulkCreateDto.doctors[i];
      try {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(
          doctorDto.email,
        );
        if (existingUser) {
          failed.push({
            index: i,
            email: doctorDto.email,
            error: 'Email already exists',
          });
          continue;
        }

        // Create user account - handle both invitation-based and password-based creation
        const userData: any = {
          email: doctorDto.email,
          firstName: doctorDto.firstName,
          lastName: doctorDto.lastName,
          role: UserRole.DOCTOR,
          tenantId: tenantId,
        };

        // If password is provided, hash it and activate account
        if (doctorDto.password) {
          userData.passwordHash = crypto
            .createHash('sha256')
            .update(doctorDto.password)
            .digest('hex');
          userData.status = 'active';
          userData.isEmailVerified = true;
          userData.emailVerifiedAt = new Date();
        } else {
          // Invitation-based creation
          userData.passwordHash = undefined;
          userData.status = 'pending';
          userData.isEmailVerified = false;
          userData.emailVerifiedAt = undefined;
        }

        const user = await this.usersService.create(userData);

        // Create provider profile
        const providerData = {
          userId: user.userId,
          tenantId: tenantId,
          specialization: doctorDto.specialization,
          licenseNumber: doctorDto.licenseNumber,
          qualifications: doctorDto.qualifications,
          availability: doctorDto.availability,
        };

        const provider = await this.providersService.create(providerData);

        // Send welcome email (get hospital info once outside the loop for efficiency)

        try {
          if (doctorDto.password) {
            // Backward compatibility: password was provided, send simple welcome email
            await this.emailService.sendUserInviteEmail({
              hospitalName,
              userFirstName: doctorDto.firstName,
              userLastName: doctorDto.lastName,
              userEmail: doctorDto.email,
              role: 'Doctor',
              temporaryPassword: doctorDto.password,
              resetPasswordUrl: '', // Not needed for password-based creation
              invitedByName: adminUser
                ? `${adminUser.firstName} ${adminUser.lastName}`
                : 'Hospital Admin',
            });
          } else {
            // Invitation-based: generate password reset token and send invitation
            await this.authService.requestPasswordReset(
              doctorDto.email,
              tenant?.subdomain,
            );
          }
        } catch (emailError) {
          console.error(
            `Failed to send invitation email to ${doctorDto.email}:`,
            emailError,
          );
        }

        successful.push({
          providerId: provider.providerId,
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: UserRole.DOCTOR,
          specialization: provider.specialization,
          licenseNumber: provider.licenseNumber,
          qualifications: provider.qualifications,
          availability: provider.availability,
          isActive: true,
          createdAt: provider.createdAt,
          updatedAt: provider.updatedAt,
        });
      } catch (error) {
        failed.push({
          index: i,
          email: doctorDto.email,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    return {
      created: successful,
      failed,
      totalProcessed: bulkCreateDto.doctors.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  }

  @Get('hospital-admin/list')
  @ApiOperation({
    summary: 'List all doctors in hospital (Hospital Admin)',
    description:
      'Hospital admin can view all doctors in their hospital with pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, email, or specialization',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctors list retrieved successfully',
    type: DoctorsListResponseDto,
  })
  async listDoctorsForHospital(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<DoctorsListResponseDto> {
    const tenantId = req.user.tenantId;
    const skip = (page - 1) * limit;

    // For now, get all providers - we'll need to add pagination to the service
    const providers = await this.providersService.find();

    // Filter by tenant and search if provided
    const filteredProviders = providers
      .filter((provider) => provider.tenantId === tenantId)
      .filter((provider) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          provider.specialization?.toLowerCase().includes(searchLower) ||
          provider.user?.firstName?.toLowerCase().includes(searchLower) ||
          provider.user?.lastName?.toLowerCase().includes(searchLower) ||
          provider.user?.email?.toLowerCase().includes(searchLower)
        );
      });

    const total = filteredProviders.length;
    const paginatedProviders = filteredProviders.slice(skip, skip + limit);

    const doctorsWithUserInfo = paginatedProviders.map((provider) => ({
      providerId: provider.providerId,
      userId: provider.userId,
      email: provider.user?.email || '',
      firstName: provider.user?.firstName || '',
      lastName: provider.user?.lastName || '',
      role: UserRole.DOCTOR,
      specialization: provider.specialization,
      licenseNumber: provider.licenseNumber,
      qualifications: provider.qualifications,
      availability: provider.availability,
      isActive: true,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    }));

    return {
      doctors: doctorsWithUserInfo,
      total,
      page,
      limit,
    };
  }

  // Regular Provider CRUD Operations (for general use)

  @Post()
  @ApiOperation({
    summary: 'Create a new provider',
    description: 'Creates a new healthcare provider record.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Provider created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all providers',
    description: 'Retrieves a list of all healthcare providers.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of providers retrieved successfully',
  })
  async findAll() {
    return this.providersService.find();
  }

  // Provider Profile Endpoints - Must come before :id route
  @Get('me')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current provider profile',
    description:
      'Returns the provider profile for the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider profile retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Provider profile not found for this user',
  })
  async getMyProfile(@Request() req) {
    try {
      const provider = await this.providersService.findOneBy({
        userId: req.user.userId,
      });

      if (!provider) {
        throw new NotFoundException('Provider profile not found for this user');
      }

      return {
        providerId: provider.providerId,
        userId: provider.userId,
        tenantId: provider.tenantId,
        licenseNumber: provider.licenseNumber,
        specialization: provider.specialization,
        qualifications: provider.qualifications,
        availability: provider.availability,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve provider profile',
      );
    }
  }

  // Availability Management Endpoints
  @Put('me/availability')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current provider availability',
    description:
      'Updates the availability schedule for the currently authenticated provider.',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Provider profile not found for this user',
  })
  async updateMyAvailability(
    @Request() req,
    @Body() updateData: { availability: Record<string, any> },
  ) {
    try {
      let provider = await this.providersService.findOneBy({
        userId: req.user.userId,
      });

      if (!provider) {
        // Auto-create a basic provider profile for doctors
        console.log(
          'No provider profile found, creating basic profile for user:',
          req.user.userId,
        );

        const user = await this.usersService.findById(req.user.userId);
        if (!user || user.role !== 'Doctor') {
          throw new NotFoundException(
            'Only doctors can manage availability. Please contact admin.',
          );
        }

        // Create basic provider profile
        provider = await this.providersService.create({
          userId: req.user.userId,
          tenantId: req.user.tenantId,
          licenseNumber: undefined,
          specialization: undefined,
          qualifications: undefined,
          availability: updateData.availability,
        });

        return {
          message:
            'Provider profile created and availability updated successfully',
          availability: updateData.availability,
        };
      }

      await this.providersService.update(
        { providerId: provider.providerId },
        { availability: updateData.availability },
      );

      return {
        message: 'Availability updated successfully',
        availability: updateData.availability,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating availability:', error);
      throw new InternalServerErrorException('Failed to update availability');
    }
  }

  @Get('me/availability')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current provider availability',
    description:
      'Returns the availability schedule for the currently authenticated provider.',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Provider profile not found for this user',
  })
  async getMyAvailability(@Request() req) {
    try {
      console.log('Getting availability for user:', req.user?.userId);

      if (!req.user?.userId) {
        throw new NotFoundException('User not authenticated');
      }

      let provider = await this.providersService.findOneBy({
        userId: req.user.userId,
      });

      if (!provider) {
        // Auto-create a basic provider profile for doctors
        console.log(
          'No provider profile found, creating basic profile for user:',
          req.user.userId,
        );

        // Get user details
        const user = await this.usersService.findById(req.user.userId);
        if (!user || user.role !== 'Doctor') {
          return {
            providerId: null,
            availability: {},
            message:
              'Only doctors can manage availability. Please contact admin.',
          };
        }

        // Create basic provider profile
        provider = await this.providersService.create({
          userId: req.user.userId,
          tenantId: req.user.tenantId,
          licenseNumber: undefined, // Will be filled later
          specialization: undefined, // Will be filled later
          qualifications: undefined,
          availability: {},
        });

        console.log('Created basic provider profile:', provider.providerId);
      }

      return {
        providerId: provider.providerId,
        availability: provider.availability || {},
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving availability:', error);
      throw new InternalServerErrorException('Failed to retrieve availability');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get provider by ID',
    description: 'Retrieves a specific provider record by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Provider not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.providersService.findOneBy({ providerId: id });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update provider',
    description: 'Updates a provider record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Provider not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    await this.providersService.update({ providerId: id }, updateProviderDto);
    return this.providersService.findOneBy({ providerId: id });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete provider',
    description: 'Deletes a provider record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Provider deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Provider not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.providersService.delete({ providerId: id });
  }
}
