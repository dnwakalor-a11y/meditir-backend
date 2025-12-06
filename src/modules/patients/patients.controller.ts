import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RbacGuard } from '../../auth/rbac.guard';
import {
  RequireTenantAdmin,
  RequirePermissions,
} from '../../auth/rbac.decorators';
import { PatientsService } from './patients.service';
import { UsersService } from '../users/users.service';
import {
  CreatePatientForHospitalDto,
  BulkCreatePatientsForHospitalDto,
  PatientCreationResponseDto,
  BulkPatientCreationResponseDto,
  CreatePatientDto,
  UpdatePatientDto,
  PatientResponseDto,
  PatientsListResponseDto,
  Gender,
} from './dto/patient.dto';
import { UserRole } from '../users/user.entity';
import * as crypto from 'crypto';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly usersService: UsersService,
  ) {}

  // Hospital Admin Endpoints for Patient Management

  @Post('hospital-admin/single')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Create a single patient (Hospital Admin)',
    description:
      'Hospital admin can create a patient with complete user account setup',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: PatientCreationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async createPatientForHospital(
    @Body() createPatientDto: CreatePatientForHospitalDto,
    @Request() req: any,
  ): Promise<PatientCreationResponseDto> {
    const tenantId = req.user.tenantId;

    try {
      // Check if user with email already exists
      const existingUser = await this.usersService.findByEmail(
        createPatientDto.email,
      );
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Hash password using crypto
      const hashedPassword = crypto
        .createHash('sha256')
        .update(createPatientDto.password)
        .digest('hex');

      // Create user account
      const userData = {
        email: createPatientDto.email,
        passwordHash: hashedPassword,
        firstName: createPatientDto.firstName,
        lastName: createPatientDto.lastName,
        role: UserRole.PATIENT,
        tenantId: tenantId,
        status: 'active' as any,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      };

      const user = await this.usersService.create(userData);

      // Create patient profile
      const patientData = {
        userId: user.userId,
        tenantId: tenantId,
        dateOfBirth: new Date(createPatientDto.dateOfBirth),
        gender: createPatientDto.gender,
        medicalRecordNumber: createPatientDto.medicalRecordNumber,
        address: createPatientDto.address,
        phoneNumber: createPatientDto.phoneNumber,
        insuranceInfo: createPatientDto.insuranceInfo,
        medicalHistory: createPatientDto.medicalHistory,
        currentVitals: createPatientDto.currentVitals,
        emergencyContact: createPatientDto.emergencyContact,
      };

      const patient = await this.patientsService.create(patientData);

      return {
        patientId: patient.patientId,
        userId: user.userId,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        medicalRecordNumber: patient.medicalRecordNumber,
        createdAt: patient.createdAt,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create patient: ' + error.message,
      );
    }
  }

  @Post('hospital-admin/bulk')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'Create multiple patients in bulk (Hospital Admin)',
    description:
      'Hospital admin can create multiple patients at once with complete user account setup',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk patient creation completed',
    type: BulkPatientCreationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid data',
  })
  async bulkCreatePatientsForHospital(
    @Body() bulkCreateDto: BulkCreatePatientsForHospitalDto,
    @Request() req: any,
  ): Promise<BulkPatientCreationResponseDto> {
    const tenantId = req.user.tenantId;
    const successful: PatientCreationResponseDto[] = [];
    const failed: Array<{ index: number; email: string; error: string }> = [];

    for (let i = 0; i < bulkCreateDto.patients.length; i++) {
      const patientDto = bulkCreateDto.patients[i];
      try {
        // Check if user already exists
        const existingUser = await this.usersService.findByEmail(
          patientDto.email,
        );
        if (existingUser) {
          failed.push({
            index: i,
            email: patientDto.email,
            error: 'Email already exists',
          });
          continue;
        }

        // Hash password
        const hashedPassword = crypto
          .createHash('sha256')
          .update(patientDto.password)
          .digest('hex');

        // Create user account
        const userData = {
          email: patientDto.email,
          passwordHash: hashedPassword,
          firstName: patientDto.firstName,
          lastName: patientDto.lastName,
          role: UserRole.PATIENT,
          tenantId: tenantId,
          status: 'active' as any,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        };

        const user = await this.usersService.create(userData);

        // Create patient profile
        const patientData = {
          userId: user.userId,
          tenantId: tenantId,
          dateOfBirth: new Date(patientDto.dateOfBirth),
          gender: patientDto.gender,
          medicalRecordNumber: patientDto.medicalRecordNumber,
          address: patientDto.address,
          phoneNumber: patientDto.phoneNumber,
          insuranceInfo: patientDto.insuranceInfo,
          medicalHistory: patientDto.medicalHistory,
          currentVitals: patientDto.currentVitals,
          emergencyContact: patientDto.emergencyContact,
        };

        const patient = await this.patientsService.create(patientData);

        successful.push({
          patientId: patient.patientId,
          userId: user.userId,
          email: user.email,
          fullName: `${user.firstName} ${user.lastName}`,
          medicalRecordNumber: patient.medicalRecordNumber,
          createdAt: patient.createdAt,
        });
      } catch (error) {
        failed.push({
          index: i,
          email: patientDto.email,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    return {
      successful,
      failed,
      summary: {
        total: bulkCreateDto.patients.length,
        successful: successful.length,
        failed: failed.length,
      },
    };
  }

  @Get('doctor/list')
  @RequirePermissions('read:patients')
  @ApiOperation({
    summary: 'List patients for provider/doctor',
    description:
      'Provider can view patients they have appointments with, with pagination',
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
    description: 'Number of patients per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Patients list retrieved successfully',
    type: PatientsListResponseDto,
  })
  async listPatientsForProvider(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<PatientsListResponseDto> {
    const providerId = req.user.userId; // Provider's user ID
    const tenantId = req.user.tenantId;

    const { patients, total } =
      await this.patientsService.getPatientsByProvider(
        providerId,
        tenantId,
        page,
        limit,
      );

    const patientsWithUserInfo = patients.map((patient) => ({
      patientId: patient.patientId,
      tenantId: patient.tenantId,
      userId: patient.userId,
      medicalRecordNumber: patient.medicalRecordNumber,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      phoneNumber: patient.phoneNumber,
      insuranceInfo: patient.insuranceInfo,
      medicalHistory: patient.medicalHistory,
      currentVitals: patient.currentVitals,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      user: patient.user
        ? {
            userId: patient.user.userId,
            email: patient.user.email,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
          }
        : undefined,
    }));

    return {
      patients: patientsWithUserInfo,
      total,
      page,
      limit,
    };
  }

  @Get('hospital-admin/list')
  @RequireTenantAdmin()
  @ApiOperation({
    summary: 'List all patients in hospital (Hospital Admin)',
    description:
      'Hospital admin can view all patients in their hospital with pagination',
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
    description: 'Search by name, email, or medical record number',
  })
  @ApiResponse({
    status: 200,
    description: 'Patients list retrieved successfully',
    type: PatientsListResponseDto,
  })
  async listPatientsForHospital(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<PatientsListResponseDto> {
    const tenantId = req.user.tenantId;
    const skip = (page - 1) * limit;

    const { patients, total } =
      await this.patientsService.findByTenantWithPagination(
        tenantId,
        skip,
        limit,
        search,
      );

    const patientsWithUserInfo = patients.map((patient) => ({
      patientId: patient.patientId,
      tenantId: patient.tenantId,
      userId: patient.userId,
      medicalRecordNumber: patient.medicalRecordNumber,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      phoneNumber: patient.phoneNumber,
      insuranceInfo: patient.insuranceInfo,
      medicalHistory: patient.medicalHistory,
      currentVitals: patient.currentVitals,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      user: patient.user
        ? {
            userId: patient.user.userId,
            email: patient.user.email,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
          }
        : undefined,
    }));

    return {
      patients: patientsWithUserInfo,
      total,
      page,
      limit,
    };
  }

  @Put('hospital-admin/:patientId')
  @ApiOperation({
    summary: 'Update patient information (Hospital Admin)',
    description: 'Hospital admin can update patient information',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async updatePatientForHospital(
    @Param('patientId') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req: any,
  ): Promise<PatientResponseDto> {
    const tenantId = req?.user?.tenantId || 'default-tenant';

    const patient = await this.patientsService.findById(patientId, tenantId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Convert date string to Date if provided
    const updateData: any = { ...updatePatientDto };
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const updatedPatient = await this.patientsService.update(
      patientId,
      tenantId,
      updateData,
    );

    return {
      patientId: updatedPatient.patientId,
      tenantId: updatedPatient.tenantId,
      userId: updatedPatient.userId,
      medicalRecordNumber: updatedPatient.medicalRecordNumber,
      dateOfBirth: updatedPatient.dateOfBirth,
      gender: updatedPatient.gender,
      address: updatedPatient.address,
      phoneNumber: updatedPatient.phoneNumber,
      insuranceInfo: updatedPatient.insuranceInfo,
      medicalHistory: updatedPatient.medicalHistory,
      currentVitals: updatedPatient.currentVitals,
      createdAt: updatedPatient.createdAt,
      updatedAt: updatedPatient.updatedAt,
      user: updatedPatient.user
        ? {
            userId: updatedPatient.user.userId,
            email: updatedPatient.user.email,
            firstName: updatedPatient.user.firstName,
            lastName: updatedPatient.user.lastName,
          }
        : undefined,
    };
  }

  @Delete('hospital-admin/:patientId')
  @ApiOperation({
    summary: 'Delete patient (Hospital Admin)',
    description:
      'Hospital admin can delete a patient and associated user account',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async deletePatientForHospital(
    @Param('patientId') patientId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const tenantId = req?.user?.tenantId || 'default-tenant';

    const patient = await this.patientsService.findById(patientId, tenantId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    await this.patientsService.delete(patientId, tenantId);
    // Note: In a real implementation, you might want to soft delete or handle user deletion differently

    return { message: 'Patient deleted successfully' };
  }

  // Regular Patient CRUD Operations (for general use)

  @Post()
  @ApiOperation({
    summary: 'Create patient profile',
    description: 'Create a patient profile for an existing user',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: PatientResponseDto,
  })
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @Request() req: any,
  ): Promise<PatientResponseDto> {
    const tenantId = req?.user?.tenantId || 'default-tenant';

    const patientData = {
      ...createPatientDto,
      tenantId,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
    };

    const patient = await this.patientsService.create(patientData);

    return {
      patientId: patient.patientId,
      tenantId: patient.tenantId,
      userId: patient.userId,
      medicalRecordNumber: patient.medicalRecordNumber,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      phoneNumber: patient.phoneNumber,
      insuranceInfo: patient.insuranceInfo,
      medicalHistory: patient.medicalHistory,
      currentVitals: patient.currentVitals,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  @Get(':patientId')
  @ApiOperation({
    summary: 'Get patient by ID',
    description: 'Retrieve patient information by patient ID',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient found',
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async getPatient(
    @Param('patientId') patientId: string,
    @Request() req: any,
  ): Promise<PatientResponseDto> {
    const tenantId = req?.user?.tenantId || 'default-tenant';

    const patient = await this.patientsService.findById(patientId, tenantId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      patientId: patient.patientId,
      tenantId: patient.tenantId,
      userId: patient.userId,
      medicalRecordNumber: patient.medicalRecordNumber,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      phoneNumber: patient.phoneNumber,
      insuranceInfo: patient.insuranceInfo,
      medicalHistory: patient.medicalHistory,
      currentVitals: patient.currentVitals,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      user: patient.user
        ? {
            userId: patient.user.userId,
            email: patient.user.email,
            firstName: patient.user.firstName,
            lastName: patient.user.lastName,
          }
        : undefined,
    };
  }

  @Put(':patientId')
  @ApiOperation({
    summary: 'Update patient',
    description: 'Update patient information',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async updatePatient(
    @Param('patientId') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req: any,
  ): Promise<PatientResponseDto> {
    const tenantId = req?.user?.tenantId || 'default-tenant';

    const patient = await this.patientsService.findById(patientId, tenantId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Convert date string to Date if provided
    const updateData: any = { ...updatePatientDto };
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const updatedPatient = await this.patientsService.update(
      patientId,
      tenantId,
      updateData,
    );

    return {
      patientId: updatedPatient.patientId,
      tenantId: updatedPatient.tenantId,
      userId: updatedPatient.userId,
      medicalRecordNumber: updatedPatient.medicalRecordNumber,
      dateOfBirth: updatedPatient.dateOfBirth,
      gender: updatedPatient.gender,
      address: updatedPatient.address,
      phoneNumber: updatedPatient.phoneNumber,
      insuranceInfo: updatedPatient.insuranceInfo,
      medicalHistory: updatedPatient.medicalHistory,
      currentVitals: updatedPatient.currentVitals,
      createdAt: updatedPatient.createdAt,
      updatedAt: updatedPatient.updatedAt,
      user: updatedPatient.user
        ? {
            userId: updatedPatient.user.userId,
            email: updatedPatient.user.email,
            firstName: updatedPatient.user.firstName,
            lastName: updatedPatient.user.lastName,
          }
        : undefined,
    };
  }
}
