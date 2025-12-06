import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  IsObject,
  MaxLength,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AppointmentStatus,
  AppointmentType,
} from '../entities/appointment.entity';

export enum CallStatus {
  NOT_STARTED = 'not_started',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ENDED = 'ended',
  FAILED = 'failed',
}

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'Appointment scheduled date and time',
    example: '2024-03-15T14:30:00Z',
    format: 'date-time',
  })
  @IsDateString()
  scheduledDateTime: string;

  @ApiProperty({
    description: 'Appointment type',
    enum: AppointmentType,
    example: AppointmentType.TELEMEDICINE,
  })
  @IsEnum(AppointmentType)
  appointmentType: AppointmentType;

  @ApiPropertyOptional({
    description: 'Duration of appointment in minutes',
    example: 30,
    default: 30,
  })
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Reason for appointment',
    example: 'Follow-up consultation for blood pressure management',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the appointment',
    example: 'Patient reports improved symptoms since last visit',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Chief complaint or primary concern',
    example: 'Chest pain and shortness of breath',
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'Appointment metadata',
    example: {
      isUrgent: false,
      requiresInterpreter: false,
      preferredLanguage: 'English',
      insuranceVerified: true,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'Requested appointment date and time',
    example: '2024-03-15T14:30:00Z',
    format: 'date-time',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({
    description: 'Duration of appointment in minutes',
    example: 30,
    default: 30,
    minimum: 15,
    maximum: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(120)
  durationMinutes?: number;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: 'Appointment scheduled date and time',
    example: '2024-03-15T15:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  scheduledDateTime?: string;

  @ApiPropertyOptional({
    description: 'Appointment type',
    enum: AppointmentType,
    example: AppointmentType.FOLLOW_UP,
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @ApiPropertyOptional({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Duration of appointment in minutes',
    example: 45,
  })
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Reason for appointment',
    example:
      'Updated: Follow-up consultation for blood pressure and new symptoms',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the appointment',
    example: 'Patient requested earlier time slot',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Chief complaint or primary concern',
    example: 'Chest pain resolved, but experiencing fatigue',
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'Actual start time of appointment',
    example: '2024-03-15T15:05:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @ApiPropertyOptional({
    description: 'Actual end time of appointment',
    example: '2024-03-15T15:50:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  actualEndTime?: string;

  @ApiPropertyOptional({
    description: 'Appointment metadata',
    example: {
      isUrgent: true,
      requiresInterpreter: false,
      preferredLanguage: 'English',
      insuranceVerified: true,
      cancellationReason: null,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment unique identifier',
    format: 'uuid',
  })
  appointmentId: string;

  @ApiProperty({
    description: 'Tenant unique identifier',
    format: 'uuid',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  patientId: string;

  @ApiProperty({
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  providerId: string;

  @ApiProperty({
    description: 'Appointment scheduled date and time',
  })
  scheduledDateTime: Date;

  @ApiProperty({
    description: 'Appointment type',
    enum: AppointmentType,
  })
  appointmentType: AppointmentType;

  @ApiProperty({
    description: 'Current appointment status',
    enum: AppointmentStatus,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Duration of appointment in minutes',
  })
  duration: number;

  @ApiPropertyOptional({
    description: 'Reason for appointment',
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the appointment',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Chief complaint or primary concern',
  })
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'Actual start time of appointment',
  })
  actualStartTime?: Date;

  @ApiPropertyOptional({
    description: 'Actual end time of appointment',
  })
  actualEndTime?: Date;

  @ApiPropertyOptional({
    description: 'Appointment metadata',
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Appointment creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Patient information',
  })
  patient?: {
    patientId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    dateOfBirth: Date;
    phoneNumber?: string;
  };

  @ApiPropertyOptional({
    description: 'Provider information',
  })
  provider?: {
    providerId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    specialties: string[];
    licenseNumber: string;
  };
}

export class AppointmentsListResponseDto {
  @ApiProperty({
    description: 'List of appointments',
    type: [AppointmentResponseDto],
  })
  appointments: AppointmentResponseDto[];

  @ApiProperty({
    description: 'Total number of appointments',
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
  })
  limit: number;
}

export class CancelAppointmentDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Patient requested cancellation due to schedule conflict',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Whether to allow reschedule',
    example: true,
    default: true,
  })
  @IsOptional()
  allowReschedule?: boolean;
}

export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'New scheduled date and time',
    example: '2024-03-16T14:30:00Z',
    format: 'date-time',
  })
  @IsDateString()
  newScheduledDateTime: string;

  @ApiPropertyOptional({
    description: 'Reason for reschedule',
    example: 'Provider unavailable at original time',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rescheduleReason?: string;
}

export class AppointmentSummaryDto {
  @ApiProperty({
    description: 'Total scheduled appointments',
  })
  totalScheduled: number;

  @ApiProperty({
    description: 'Confirmed appointments',
  })
  confirmed: number;

  @ApiProperty({
    description: 'Completed appointments',
  })
  completed: number;

  @ApiProperty({
    description: 'Cancelled appointments',
  })
  cancelled: number;

  @ApiProperty({
    description: 'No-show appointments',
  })
  noShow: number;

  @ApiProperty({
    description: 'Appointments by type',
  })
  byType: Record<string, number>;

  @ApiProperty({
    description: 'Upcoming appointments in next 7 days',
  })
  upcomingWeek: number;
}

// WebRTC and Telemedicine DTOs
export class StartCallDto {
  @ApiProperty({
    description: 'WebRTC room ID for the video call',
    example: 'room-123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  roomId: string;

  @ApiPropertyOptional({
    description: 'Additional call configuration',
  })
  @IsOptional()
  @IsObject()
  callConfig?: any;
}

export class UpdateCallStatusDto {
  @ApiProperty({
    description: 'Current call status',
    enum: CallStatus,
    example: CallStatus.ACTIVE,
  })
  @IsEnum(CallStatus)
  callStatus: CallStatus;

  @ApiPropertyOptional({
    description: 'WebRTC room ID',
  })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Call started timestamp',
    example: '2024-03-15T14:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  callStartedAt?: string;

  @ApiPropertyOptional({
    description: 'Call ended timestamp',
    example: '2024-03-15T15:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  callEndedAt?: string;
}

export class SaveConsultationNotesDto {
  @ApiProperty({
    description: 'Consultation notes and observations',
    example: 'Patient reported improved symptoms...',
  })
  @IsString()
  @MaxLength(5000)
  notes: string;

  @ApiPropertyOptional({
    description: 'AI-generated transcript of the consultation',
  })
  @IsOptional()
  @IsString()
  aiTranscript?: string;

  @ApiPropertyOptional({
    description: 'AI-generated summary and insights',
  })
  @IsOptional()
  @IsString()
  aiSummary?: string;

  @ApiPropertyOptional({
    description: 'Prescription details',
  })
  @IsOptional()
  @IsObject()
  prescription?: any;

  @ApiPropertyOptional({
    description: 'Diagnosis information',
  })
  @IsOptional()
  @IsObject()
  diagnosis?: any;

  @ApiPropertyOptional({
    description: 'Follow-up recommendations',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  followUpRecommendations?: string;

  @ApiPropertyOptional({
    description: 'Patient vital signs during consultation',
  })
  @IsOptional()
  @IsObject()
  vitalSigns?: any;
}

export class TelemedicineAppointmentDto extends CreateAppointmentDto {
  @ApiProperty({
    description: 'Indicates this is a telemedicine appointment',
    example: true,
  })
  @IsBoolean()
  isTelemedicine: boolean;

  @ApiPropertyOptional({
    description: 'Pre-call setup requirements',
  })
  @IsOptional()
  @IsObject()
  callSetup?: any;

  @ApiPropertyOptional({
    description: 'Patient device compatibility info',
  })
  @IsOptional()
  @IsObject()
  deviceInfo?: any;
}
