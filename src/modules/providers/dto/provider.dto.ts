import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsUUID,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    description: 'User ID associated with this provider',
    format: 'uuid',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Professional license number',
    example: 'MD123456789',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  licenseNumber: string;

  @ApiProperty({
    description: 'Medical specialties',
    example: ['Cardiology', 'Internal Medicine'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  specialties: string[];

  @ApiPropertyOptional({
    description: 'Professional credentials and certifications',
    example: ['MD', 'FACC', 'Board Certified Cardiologist'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  credentials?: string[];

  @ApiPropertyOptional({
    description: 'Office address',
    example: '456 Medical Center Blvd, Healthcare City, ST 12345',
  })
  @IsOptional()
  @IsString()
  officeAddress?: string;

  @ApiPropertyOptional({
    description: 'Office phone number',
    example: '+15551234567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  officePhone?: string;

  @ApiPropertyOptional({
    description: 'Provider biography',
    example:
      'Dr. Smith is a board-certified cardiologist with over 15 years of experience...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Professional experience and education',
    example: {
      education: [
        'Harvard Medical School MD 2005',
        'Johns Hopkins Residency 2008',
      ],
      experience: [
        'Attending Physician at City Hospital 2008-2015',
        'Chief of Cardiology 2015-Present',
      ],
      publications: ['Heart Disease Management - Journal of Cardiology 2020'],
    },
  })
  @IsOptional()
  @IsObject()
  professionalProfile?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Provider availability schedule',
    example: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '15:00' },
      timeZone: 'America/New_York',
    },
  })
  @IsOptional()
  @IsObject()
  availability?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Consultation rates in cents',
    example: {
      standardConsultation: 15000,
      followUpConsultation: 10000,
      emergencyConsultation: 25000,
    },
  })
  @IsOptional()
  @IsObject()
  consultationRates?: Record<string, any>;
}

export class UpdateProviderDto {
  @ApiPropertyOptional({
    description: 'Professional license number',
    example: 'MD123456789-RENEWED',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Medical specialties',
    example: ['Cardiology', 'Internal Medicine', 'Preventive Medicine'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({
    description: 'Professional credentials and certifications',
    example: ['MD', 'FACC', 'Board Certified Cardiologist', 'Fellow ACP'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  credentials?: string[];

  @ApiPropertyOptional({
    description: 'Office address',
    example: '789 New Medical Plaza, Updated City, ST 54321',
  })
  @IsOptional()
  @IsString()
  officeAddress?: string;

  @ApiPropertyOptional({
    description: 'Office phone number',
    example: '+15559876543',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  officePhone?: string;

  @ApiPropertyOptional({
    description: 'Provider biography',
    example:
      'Dr. Smith is a board-certified cardiologist with over 20 years of experience...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Professional experience and education',
    example: {
      education: [
        'Harvard Medical School MD 2005',
        'Johns Hopkins Residency 2008',
        'Mayo Clinic Fellowship 2010',
      ],
      experience: [
        'Attending Physician at City Hospital 2008-2015',
        'Chief of Cardiology 2015-Present',
        'Research Director 2020-Present',
      ],
      publications: [
        'Heart Disease Management - Journal of Cardiology 2020',
        'Advanced Cardiac Care - Medical Review 2023',
      ],
    },
  })
  @IsOptional()
  @IsObject()
  professionalProfile?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Provider availability schedule',
    example: {
      monday: { start: '08:00', end: '17:00' },
      tuesday: { start: '08:00', end: '17:00' },
      wednesday: { start: '08:00', end: '17:00' },
      thursday: { start: '08:00', end: '17:00' },
      friday: { start: '08:00', end: '16:00' },
      saturday: { start: '09:00', end: '13:00' },
      timeZone: 'America/New_York',
    },
  })
  @IsOptional()
  @IsObject()
  availability?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Consultation rates in cents',
    example: {
      standardConsultation: 17500,
      followUpConsultation: 12500,
      emergencyConsultation: 30000,
      groupConsultation: 8000,
    },
  })
  @IsOptional()
  @IsObject()
  consultationRates?: Record<string, any>;
}

export class ProviderResponseDto {
  @ApiProperty({
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  providerId: string;

  @ApiProperty({
    description: 'Tenant unique identifier',
    format: 'uuid',
  })
  tenantId: string;

  @ApiProperty({
    description: 'User unique identifier',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Professional license number',
  })
  licenseNumber: string;

  @ApiProperty({
    description: 'Medical specialties',
    type: [String],
  })
  specialties: string[];

  @ApiPropertyOptional({
    description: 'Professional credentials and certifications',
    type: [String],
  })
  credentials?: string[];

  @ApiPropertyOptional({
    description: 'Office address',
  })
  officeAddress?: string;

  @ApiPropertyOptional({
    description: 'Office phone number',
  })
  officePhone?: string;

  @ApiPropertyOptional({
    description: 'Provider biography',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Professional experience and education',
  })
  professionalProfile?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Provider availability schedule',
  })
  availability?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Consultation rates in cents',
  })
  consultationRates?: Record<string, any>;

  @ApiProperty({
    description: 'Provider record creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Associated user information',
  })
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class ProvidersListResponseDto {
  @ApiProperty({
    description: 'List of providers',
    type: [ProviderResponseDto],
  })
  providers: ProviderResponseDto[];

  @ApiProperty({
    description: 'Total number of providers',
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

export class ProviderAvailabilityDto {
  @ApiProperty({
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'Date to check availability for',
    example: '2024-03-15',
    format: 'date',
  })
  @IsString()
  date: string;
}

export class AvailableSlotDto {
  @ApiProperty({
    description: 'Available time slot start time',
    example: '14:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'Available time slot end time',
    example: '14:30',
  })
  endTime: string;

  @ApiProperty({
    description: 'Slot availability status',
  })
  available: boolean;
}

export class ProviderAvailabilityResponseDto {
  @ApiProperty({
    description: 'Provider unique identifier',
    format: 'uuid',
  })
  providerId: string;

  @ApiProperty({
    description: 'Date of availability',
    format: 'date',
  })
  date: string;

  @ApiProperty({
    description: 'Available time slots',
    type: [AvailableSlotDto],
  })
  availableSlots: AvailableSlotDto[];
}
