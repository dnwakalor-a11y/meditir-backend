import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AppointmentService } from '../services/appointment.service';
import { WebRTCService } from '../services/webrtc.service';
import { MedicalRecordService } from '../services/medical-record.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  SaveConsultationNotesDto,
  TelemedicineAppointmentDto,
  StartCallDto,
  UpdateCallStatusDto,
} from '../dto/appointment.dto';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordQueryDto,
} from '../dto/medical-record.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant ID',
  required: true,
})
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly webrtcService: WebRTCService,
    private readonly medicalRecordService: MedicalRecordService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.create(createAppointmentDto, tenantId);
  }

  @Post('telemedicine')
  @ApiOperation({ summary: 'Create a telemedicine appointment' })
  @ApiResponse({
    status: 201,
    description: 'Telemedicine appointment created successfully',
  })
  async createTelemedicine(
    @Body() telemedicineDto: TelemedicineAppointmentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.createTelemedicine(
      telemedicineDto,
      tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  async findAll(@Query() query: any, @Headers('x-tenant-id') tenantId: string) {
    return await this.appointmentService.findAll(query, tenantId);
  }

  @Get('provider/today/:providerId')
  @ApiOperation({ summary: "Get today's appointments for provider" })
  @ApiResponse({
    status: 200,
    description: "Today's appointments retrieved successfully",
  })
  async getTodaysAppointments(
    @Param('providerId') providerId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.getTodaysAppointments(
      providerId,
      tenantId,
    );
  }

  @Get('provider/callable/:providerId')
  @ApiOperation({ summary: 'Get appointments that can start video calls' })
  @ApiResponse({
    status: 200,
    description: 'Callable appointments retrieved successfully',
  })
  async getCallableAppointments(
    @Param('providerId') providerId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.getCallableAppointments(
      providerId,
      tenantId,
    );
  }

  @Get('provider/statistics/:providerId')
  @ApiOperation({ summary: 'Get appointment statistics for provider' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getProviderStatistics(
    @Param('providerId') providerId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.getProviderStatistics(
      providerId,
      tenantId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
  })
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.update(
      id,
      updateAppointmentDto,
      tenantId,
    );
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
  })
  async cancel(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.cancel(id, tenantId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment completed successfully',
  })
  async complete(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.complete(id, tenantId);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Save consultation notes' })
  @ApiResponse({ status: 200, description: 'Notes saved successfully' })
  async saveConsultationNotes(
    @Param('id') id: string,
    @Body() notesDto: SaveConsultationNotesDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.saveConsultationNotes(
      id,
      notesDto,
      tenantId,
    );
  }

  // WebRTC Video Call Endpoints
  @Post(':id/call/start')
  @ApiOperation({ summary: 'Start video call for appointment' })
  @ApiResponse({ status: 200, description: 'Video call started successfully' })
  async startCall(
    @Param('id') appointmentId: string,
    @Body() startCallDto: StartCallDto,
  ) {
    return await this.webrtcService.startCall(appointmentId, startCallDto);
  }

  @Post(':id/call/join/:userId')
  @ApiOperation({ summary: 'Join video call' })
  @ApiResponse({ status: 200, description: 'Joined call successfully' })
  async joinCall(
    @Param('id') appointmentId: string,
    @Param('userId') userId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const appointment = await this.appointmentService.findOne(
      appointmentId,
      tenantId,
    );
    return await this.webrtcService.joinCall(appointment.roomId, userId);
  }

  @Post(':id/call/leave/:userId')
  @ApiOperation({ summary: 'Leave video call' })
  @ApiResponse({ status: 200, description: 'Left call successfully' })
  async leaveCall(
    @Param('id') appointmentId: string,
    @Param('userId') userId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const appointment = await this.appointmentService.findOne(
      appointmentId,
      tenantId,
    );
    return await this.webrtcService.leaveCall(appointment.roomId, userId);
  }

  @Post(':id/call/end')
  @ApiOperation({ summary: 'End video call' })
  @ApiResponse({ status: 200, description: 'Call ended successfully' })
  async endCall(
    @Param('id') appointmentId: string,
    @Body() updateCallStatusDto: UpdateCallStatusDto,
  ) {
    return await this.webrtcService.endCall(appointmentId, updateCallStatusDto);
  }

  @Get(':id/call/status')
  @ApiOperation({ summary: 'Get call status' })
  @ApiResponse({
    status: 200,
    description: 'Call status retrieved successfully',
  })
  async getCallStatus(
    @Param('id') appointmentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const appointment = await this.appointmentService.findOne(
      appointmentId,
      tenantId,
    );
    return await this.webrtcService.getCallStatus(appointment.roomId);
  }

  @Get(':id/call/statistics')
  @ApiOperation({ summary: 'Get call statistics' })
  @ApiResponse({
    status: 200,
    description: 'Call statistics retrieved successfully',
  })
  async getCallStatistics(@Param('id') appointmentId: string) {
    return await this.webrtcService.getCallStatistics(appointmentId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 204, description: 'Appointment deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.remove(id, tenantId);
  }

  // Patient-specific endpoints
  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get appointments for a specific patient' })
  @ApiResponse({
    status: 200,
    description: 'Patient appointments retrieved successfully',
  })
  async getPatientAppointments(
    @Param('patientId') patientId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.getPatientAppointments(
      patientId,
      tenantId,
    );
  }

  @Post('patient/book')
  @ApiOperation({ summary: 'Book appointment for patient' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  async bookAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.create(createAppointmentDto, tenantId);
  }

  @Patch('patient/:id/cancel')
  @ApiOperation({ summary: 'Cancel appointment by patient' })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
  })
  async cancelAppointment(
    @Param('id') appointmentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentService.cancelAppointment(
      appointmentId,
      tenantId,
    );
  }
}
