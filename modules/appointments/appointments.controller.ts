import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiHeader,
} from '@nestjs/swagger';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CheckAvailabilityDto,
} from './dto/appointment.dto';
import { AppointmentsService } from './appointments.service';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new appointment',
    description: 'Creates a new appointment between a patient and provider.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    // Convert string date to Date object
    const appointmentData = {
      ...createAppointmentDto,
      scheduledDateTime: new Date(createAppointmentDto.scheduledDateTime),
    };
    return this.appointmentsService.create(appointmentData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all appointments',
    description: 'Retrieves a list of all appointments.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of appointments retrieved successfully',
  })
  async findAll() {
    return this.appointmentsService.find();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment by ID',
    description: 'Retrieves a specific appointment record by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOneBy({ appointmentId: id });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update appointment',
    description: 'Updates an appointment record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    // Convert DTO to entity-compatible format
    const updateData = {
      ...updateAppointmentDto,
      ...(updateAppointmentDto.scheduledDateTime && {
        scheduledDateTime: new Date(updateAppointmentDto.scheduledDateTime),
      }),
    };
    await this.appointmentsService.update({ appointmentId: id }, updateData);
    return this.appointmentsService.findOneBy({ appointmentId: id });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete appointment',
    description: 'Deletes an appointment record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Appointment deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.appointmentsService.delete({ appointmentId: id });
  }

  @Get('provider/:providerId')
  @ApiOperation({
    summary: 'Get appointments by provider',
    description: 'Retrieves all appointments for a specific provider.',
  })
  @ApiParam({
    name: 'providerId',
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Provider appointments retrieved successfully',
  })
  async getByProvider(@Param('providerId', ParseUUIDPipe) providerId: string) {
    return this.appointmentsService.findByProvider(providerId);
  }

  @Get('patient/:patientId')
  @ApiOperation({
    summary: 'Get appointments by patient',
    description: 'Retrieves all appointments for a specific patient.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient appointments retrieved successfully',
  })
  async getByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Post('check-availability')
  @ApiOperation({
    summary: 'Check appointment slot availability',
    description: 'Checks if a specific time slot is available for a provider.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability check completed',
  })
  async checkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    const isAvailable =
      await this.appointmentsService.checkTimeSlotAvailability(
        checkAvailabilityDto.providerId,
        new Date(checkAvailabilityDto.scheduledAt),
        checkAvailabilityDto.durationMinutes || 30,
      );
    return { available: isAvailable };
  }

  // Patient-specific endpoints
  @Post('patient/book')
  @ApiOperation({
    summary: 'Book appointment for patient',
    description: 'Books a new appointment for a patient with a provider.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment booked successfully',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID',
    required: true,
  })
  @HttpCode(HttpStatus.CREATED)
  async bookAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const appointmentData = {
      ...createAppointmentDto,
      scheduledDateTime: new Date(createAppointmentDto.scheduledDateTime),
      tenantId,
    };
    return await this.appointmentsService.create(appointmentData);
  }

  @Get('patient/:patientId')
  @ApiOperation({
    summary: 'Get appointments for a specific patient',
    description: 'Retrieves all appointments for the specified patient.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient appointments retrieved successfully',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID',
    required: true,
  })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  async getPatientAppointments(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentsService.getPatientAppointments(
      patientId,
      tenantId,
    );
  }

  @Patch('patient/:id/cancel')
  @ApiOperation({
    summary: 'Cancel appointment by patient',
    description: 'Cancels an appointment requested by the patient.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment cancelled successfully',
  })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  async cancelAppointment(
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.appointmentsService.cancelAppointment(
      appointmentId,
      tenantId,
    );
  }
}
