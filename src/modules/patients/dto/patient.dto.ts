import {
  IsString,
  IsOptional,
  IsObject,
  IsDateString,
  IsPhoneNumber,
  MaxLength,
  IsEmail,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  Matches,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
  PREFER_NOT_TO_SAY = 'Prefer not to say',
}

export enum Role {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  HOSPITAL_ADMIN = 'hospital_admin',
}

// Hospital Admin Patient Creation DTO (Single)
export class CreatePatientForHospitalDto {
  // User Information
  @ApiProperty({
    description: 'Patient email address',
    example: 'patient@hospital.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for patient account',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'Patient first name',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'Patient last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Patient phone number',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  // Patient-specific Information
  @ApiProperty({
    description: 'Patient date of birth',
    example: '1990-01-15',
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiPropertyOptional({
    description: 'Patient gender',
    example: Gender.MALE,
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Medical record number (if applicable)',
    example: 'MRN-12345',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  medicalRecordNumber?: string;

  @ApiPropertyOptional({
    description: 'Patient address',
    example: '123 Main St, Anytown, ST 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Insurance information',
    example: {
      provider: 'HealthCare Plus',
      policyNumber: 'HC123456789',
      groupNumber: 'GRP001',
      expiryDate: '2025-12-31',
    },
  })
  @IsOptional()
  @IsObject()
  insuranceInfo?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical history summary',
    example: {
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Diabetes Type 2'],
      surgeries: ['Appendectomy 2018'],
      familyHistory: ['Heart Disease (Father)'],
    },
  })
  @IsOptional()
  @IsObject()
  medicalHistory?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Current vital signs from last appointment',
    example: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      weight: 70,
      height: 175,
    },
  })
  @IsOptional()
  @IsObject()
  currentVitals?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Emergency contact information',
    example: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phoneNumber: '+1987654321',
      email: 'jane.doe@email.com',
    },
  })
  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, any>;
}

// Hospital Admin Bulk Patient Creation DTO
export class BulkCreatePatientsForHospitalDto {
  @ApiProperty({
    description: 'Array of patients to create',
    type: [CreatePatientForHospitalDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePatientForHospitalDto)
  patients: CreatePatientForHospitalDto[];
}

// Response DTOs for Hospital Admin Operations
export class PatientCreationResponseDto {
  @ApiProperty({
    description: 'Created patient unique identifier',
    format: 'uuid',
  })
  patientId: string;

  @ApiProperty({
    description: 'Created user unique identifier',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Patient email',
  })
  email: string;

  @ApiProperty({
    description: 'Patient full name',
  })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Medical record number',
  })
  medicalRecordNumber?: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;
}

export class BulkPatientCreationResponseDto {
  @ApiProperty({
    description: 'Successfully created patients',
    type: [PatientCreationResponseDto],
  })
  successful: PatientCreationResponseDto[];

  @ApiProperty({
    description: 'Failed patient creations with errors',
    example: [
      {
        index: 0,
        email: 'invalid@example.com',
        error: 'Email already exists',
      },
    ],
  })
  failed: Array<{
    index: number;
    email: string;
    error: string;
  }>;

  @ApiProperty({
    description: 'Summary of operation',
  })
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Original DTOs (maintained for backward compatibility)
export class CreatePatientDto {
  @ApiProperty({
    description: 'User ID associated with this patient',
    format: 'uuid',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Medical record number (if applicable)',
    example: 'MRN-12345',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  medicalRecordNumber?: string;

  @ApiProperty({
    description: 'Patient date of birth',
    example: '1990-01-15',
    format: 'date',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiPropertyOptional({
    description: 'Patient gender',
    example: 'Male',
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({
    description: 'Patient address',
    example: '123 Main St, Anytown, ST 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Patient phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Insurance information',
    example: {
      provider: 'HealthCare Plus',
      policyNumber: 'HC123456789',
      groupNumber: 'GRP001',
      expiryDate: '2025-12-31',
    },
  })
  @IsOptional()
  @IsObject()
  insuranceInfo?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical history summary',
    example: {
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Diabetes Type 2'],
      surgeries: ['Appendectomy 2018'],
      familyHistory: ['Heart Disease (Father)'],
    },
  })
  @IsOptional()
  @IsObject()
  medicalHistory?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Current vital signs from last appointment',
    example: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      weight: 70,
      height: 175,
    },
  })
  @IsOptional()
  @IsObject()
  currentVitals?: Record<string, any>;
}

export class UpdatePatientDto {
  @ApiPropertyOptional({
    description: 'Medical record number (if applicable)',
    example: 'MRN-12345-UPDATED',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  medicalRecordNumber?: string;

  @ApiPropertyOptional({
    description: 'Patient date of birth',
    example: '1990-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Patient gender',
    example: 'Female',
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({
    description: 'Patient address',
    example: '456 Oak Ave, Newtown, ST 67890',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Patient phone number',
    example: '+1987654321',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Insurance information',
    example: {
      provider: 'Better Health Insurance',
      policyNumber: 'BH987654321',
      groupNumber: 'GRP002',
      expiryDate: '2026-06-30',
    },
  })
  @IsOptional()
  @IsObject()
  insuranceInfo?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical history summary',
    example: {
      allergies: ['Penicillin', 'Shellfish'],
      chronicConditions: ['Diabetes Type 2', 'Hypertension'],
      surgeries: ['Appendectomy 2018', 'Gallbladder removal 2022'],
      familyHistory: ['Heart Disease (Father)', 'Cancer (Mother)'],
    },
  })
  @IsOptional()
  @IsObject()
  medicalHistory?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Current vital signs from last appointment',
    example: {
      bloodPressure: '118/76',
      heartRate: 68,
      temperature: 98.4,
      weight: 68,
      height: 175,
    },
  })
  @IsOptional()
  @IsObject()
  currentVitals?: Record<string, any>;
}

export class PatientResponseDto {
  @ApiProperty({
    description: 'Patient unique identifier',
    format: 'uuid',
  })
  patientId: string;

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

  @ApiPropertyOptional({
    description: 'Medical record number',
  })
  medicalRecordNumber?: string;

  @ApiProperty({
    description: 'Patient date of birth',
    format: 'date',
  })
  dateOfBirth: Date;

  @ApiPropertyOptional({
    description: 'Patient gender',
  })
  gender?: string;

  @ApiPropertyOptional({
    description: 'Patient address',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Patient phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Insurance information',
  })
  insuranceInfo?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Medical history summary',
  })
  medicalHistory?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Current vital signs',
  })
  currentVitals?: Record<string, any>;

  @ApiProperty({
    description: 'Patient record creation timestamp',
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

export class PatientsListResponseDto {
  @ApiProperty({
    description: 'List of patients',
    type: [PatientResponseDto],
  })
  patients: PatientResponseDto[];

  @ApiProperty({
    description: 'Total number of patients',
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
