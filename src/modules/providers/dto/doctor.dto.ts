import {
  IsString,
  IsOptional,
  IsEmail,
  IsStrongPassword,
  IsEnum,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsPhoneNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export class CreateDoctorDto {
  // User fields
  @ApiProperty({
    description: 'Doctor email address',
    example: 'dr.smith@hospital.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Doctor password (optional for invitation-based creation)',
    example: 'SecurePassword123!',
  })
  @IsOptional()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password?: string;

  @ApiProperty({
    description: 'Doctor first name',
    example: 'John',
  })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Doctor last name',
    example: 'Smith',
  })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Doctor phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Doctor date of birth',
    example: '1980-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Doctor gender',
    enum: Gender,
    example: Gender.Male,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Doctor address',
    example: '123 Medical Street, City, State 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  // Provider fields
  @ApiProperty({
    description: 'Medical license number',
    example: 'MD123456789',
  })
  @IsString()
  @MaxLength(100)
  licenseNumber: string;

  @ApiProperty({
    description: 'Medical specialization',
    example: 'Cardiology',
  })
  @IsString()
  @MaxLength(255)
  specialization: string;

  @ApiPropertyOptional({
    description: 'Professional qualifications',
    example: 'MD, FACC, Board Certified Cardiologist',
  })
  @IsOptional()
  @IsString()
  qualifications?: string;

  @ApiPropertyOptional({
    description: 'Doctor availability schedule',
    example: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      timeZone: 'America/New_York',
    },
  })
  @IsOptional()
  availability?: Record<string, any>;
}

export class UpdateDoctorDto {
  // User fields
  @ApiPropertyOptional({
    description: 'Doctor email address',
    example: 'dr.smith@hospital.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Doctor first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Doctor last name',
    example: 'Smith',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Doctor phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Doctor date of birth',
    example: '1980-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Doctor gender',
    enum: Gender,
    example: Gender.Male,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Doctor address',
    example: '123 Medical Street, City, State 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  // Provider fields
  @ApiPropertyOptional({
    description: 'Medical license number',
    example: 'MD123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Medical specialization',
    example: 'Cardiology',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Professional qualifications',
    example: 'MD, FACC, Board Certified Cardiologist',
  })
  @IsOptional()
  @IsString()
  qualifications?: string;

  @ApiPropertyOptional({
    description: 'Doctor availability schedule',
    example: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      timeZone: 'America/New_York',
    },
  })
  @IsOptional()
  availability?: Record<string, any>;
}

export class BulkCreateDoctorsDto {
  @ApiProperty({
    description: 'Array of doctors to create',
    type: [CreateDoctorDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDoctorDto)
  doctors: CreateDoctorDto[];
}

export class DoctorResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Provider ID',
    example: 'uuid',
  })
  providerId: string;

  @ApiProperty({
    description: 'Doctor email',
    example: 'dr.smith@hospital.com',
  })
  email: string;

  @ApiProperty({
    description: 'Doctor first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Doctor last name',
    example: 'Smith',
  })
  lastName: string;

  @ApiProperty({
    description: 'Doctor role',
    example: 'Doctor',
  })
  role: string;

  @ApiPropertyOptional({
    description: 'Doctor phone number',
    example: '+1234567890',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Doctor date of birth',
    example: '1980-01-01',
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Doctor gender',
    example: 'Male',
  })
  gender?: string;

  @ApiPropertyOptional({
    description: 'Doctor address',
    example: '123 Medical Street, City, State 12345',
  })
  address?: string;

  @ApiProperty({
    description: 'Medical license number',
    example: 'MD123456789',
  })
  licenseNumber: string;

  @ApiProperty({
    description: 'Medical specialization',
    example: 'Cardiology',
  })
  specialization: string;

  @ApiPropertyOptional({
    description: 'Professional qualifications',
    example: 'MD, FACC, Board Certified Cardiologist',
  })
  qualifications?: string;

  @ApiPropertyOptional({
    description: 'Doctor availability schedule',
  })
  availability?: Record<string, any>;

  @ApiProperty({
    description: 'Is user active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00Z',
  })
  updatedAt: Date;
}

export class DoctorsListResponseDto {
  @ApiProperty({
    description: 'List of doctors',
    type: [DoctorResponseDto],
  })
  doctors: DoctorResponseDto[];

  @ApiProperty({
    description: 'Total number of doctors',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;
}

export class BulkCreateDoctorsResponseDto {
  @ApiProperty({
    description: 'Successfully created doctors',
    type: [DoctorResponseDto],
  })
  created: DoctorResponseDto[];

  @ApiProperty({
    description: 'Failed creations with error details',
    example: [
      {
        index: 2,
        email: 'invalid.email',
        error: 'Invalid email format',
      },
    ],
  })
  failed: Array<{
    index: number;
    email: string;
    error: string;
  }>;

  @ApiProperty({
    description: 'Total number processed',
    example: 10,
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Number successfully created',
    example: 8,
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of failures',
    example: 2,
  })
  failureCount: number;
}
