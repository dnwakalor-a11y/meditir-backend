import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.PATIENT,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: 'User account status',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    enumName: 'UserStatus',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Role-specific profile data',
    example: {
      specialization: 'Cardiology',
      licenseNumber: 'MD12345',
      experience: '5 years',
    },
  })
  @IsOptional()
  @IsObject()
  profileData?: Record<string, any>;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User account status',
    enum: UserStatus,
    enumName: 'UserStatus',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Role-specific profile data',
    example: {
      specialization: 'Cardiology',
      licenseNumber: 'MD12345',
      experience: '10 years',
    },
  })
  @IsOptional()
  @IsObject()
  profileData?: Record<string, any>;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'oldPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Tenant unique identifier',
    format: 'uuid',
  })
  tenantId: string;

  @ApiProperty({
    description: 'User email address',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
  })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    enumName: 'UserRole',
  })
  role: UserRole;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    enumName: 'UserStatus',
  })
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'Role-specific profile data',
  })
  profileData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}

export class UsersListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
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

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    enumName: 'UserRole',
  })
  role: UserRole;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    enumName: 'UserStatus',
  })
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'Role-specific profile data',
    example: {
      specialization: 'Cardiology',
      licenseNumber: 'MD12345',
      phoneNumber: '+1234567890',
      dateOfBirth: '1985-05-15',
      gender: 'Male',
      address: '123 Main St, City, State',
    },
  })
  profileData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Tenant information',
  })
  tenant?: {
    tenantId: string;
    name: string;
    subdomain: string;
  };

  @ApiPropertyOptional({
    description: 'Provider information (for doctors/nurses)',
  })
  provider?: {
    providerId: string;
    specialization: string;
    licenseNumber: string;
    qualifications?: string;
    isActive: boolean;
  };

  @ApiPropertyOptional({
    description: 'Patient information (for patients)',
  })
  patient?: {
    patientId: string;
    medicalRecordNumber: string;
    dateOfBirth: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
  };
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Role-specific profile data',
    example: {
      phoneNumber: '+1234567890',
      dateOfBirth: '1985-05-15',
      gender: 'Male',
      address: '123 Main St, City, State',
      specialization: 'Cardiology',
      licenseNumber: 'MD12345',
    },
  })
  @IsOptional()
  @IsObject()
  profileData?: Record<string, any>;
}
