import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PatientsService } from '../patients/patients.service';
import { UsersService } from '../users/users.service';
import { PatientResponseDto } from '../patients/dto/patient.dto';
import { UserResponseDto } from '../users/dto/user.dto';

@ApiTags('Doctor')
@ApiBearerAuth()
@Controller('doctor')
@UseGuards(JwtAuthGuard)
export class DoctorController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('patients')
  @ApiOperation({ 
    summary: 'Get patients assigned to doctor',
    description: 'Returns patients assigned to the authenticated doctor' 
  })
  @ApiResponse({
    status: 200,
    description: 'Patients retrieved successfully',
    type: [PatientResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getMyPatients(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ patients: PatientResponseDto[]; total: number; page: number; limit: number }> {
    const user = req.user as any;
    const tenantId = user.tenantId;
    const providerId = user.provider?.id || user.id;

    // Get patients assigned to this doctor through appointments
    const result = await this.patientsService.getPatientsByProvider(
      providerId,
      tenantId,
      page || 1,
      limit || 10,
    );

    return result;
  }

  @Get('patients/users')
  @ApiOperation({ 
    summary: 'Get patient user data for assigned patients',
    description: 'Returns user information for patients assigned to the authenticated doctor' 
  })
  @ApiResponse({
    status: 200,
    description: 'Patient users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getMyPatientUsers(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    const user = req.user as any;
    const tenantId = user.tenantId;
    const providerId = user.provider?.id || user.id;

    // Get patient users for patients assigned to this doctor
    const result = await this.usersService.getPatientUsersByProvider(
      providerId,
      tenantId,
      page || 1,
      limit || 10,
    );

    return result;
  }
}