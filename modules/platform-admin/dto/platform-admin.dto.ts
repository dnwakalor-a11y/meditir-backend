import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  ValidateNested,
  IsUrl,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus } from '../../tenants/tenant.entity';

// ===================== HOSPITAL/TENANT MANAGEMENT DTOs =====================

export class CreateHospitalDto {
  @ApiProperty({
    description: 'Hospital name',
    example: 'St. Mary Medical Center',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Hospital subdomain',
    example: 'st-mary-medical',
  })
  @IsString()
  subdomain: string;

  @ApiProperty({
    description: 'Admin email for the hospital',
    example: 'admin@stmary.com',
  })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({
    description: 'Admin first name',
    example: 'John',
  })
  @IsString()
  adminFirstName: string;

  @ApiProperty({
    description: 'Admin last name',
    example: 'Smith',
  })
  @IsString()
  adminLastName: string;

  @ApiProperty({
    description: 'Hospital phone number',
    example: '+1-555-123-4567',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Hospital website URL',
    example: 'https://stmary.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Hospital address',
    required: false,
  })
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @ApiProperty({
    description: 'Hospital branding configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  brandingConfig?: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    theme: string;
  };

  @ApiProperty({
    description: 'Hospital language preference',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Hospital timezone',
    example: 'America/New_York',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Maximum number of users allowed',
    example: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiProperty({
    description: 'Features enabled for this hospital',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];
}

export class UpdateHospitalDto {
  @ApiProperty({
    description: 'Hospital name',
    example: 'St. Mary Medical Center',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Hospital phone number',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Hospital website URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Hospital address',
    required: false,
  })
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @ApiProperty({
    description: 'Hospital branding configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  brandingConfig?: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    theme: string;
  };

  @ApiProperty({
    description: 'Hospital language preference',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Hospital timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Maximum number of users allowed',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiProperty({
    description: 'Features enabled for this hospital',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];

  @ApiProperty({
    description: 'Hospital status',
    enum: TenantStatus,
    required: false,
    example: TenantStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}

export class HospitalResponseDto {
  @ApiProperty({ description: 'Hospital ID' })
  tenantId: string;

  @ApiProperty({ description: 'Hospital name' })
  name: string;

  @ApiProperty({ description: 'Hospital subdomain' })
  subdomain: string;

  @ApiProperty({ description: 'Hospital phone number' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Hospital website URL' })
  website?: string;

  @ApiProperty({ description: 'Hospital address' })
  address?: any;

  @ApiProperty({ description: 'Hospital branding configuration' })
  brandingConfig?: any;

  @ApiProperty({ description: 'Hospital language preference' })
  language: string;

  @ApiProperty({ description: 'Hospital timezone' })
  timezone?: string;

  @ApiProperty({ description: 'Maximum number of users allowed' })
  maxUsers?: number;

  @ApiProperty({ description: 'Features enabled for this hospital' })
  enabledFeatures?: string[];

  @ApiProperty({
    description: 'Hospital status',
    enum: TenantStatus,
    example: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @ApiProperty({ description: 'Number of active users' })
  activeUsersCount: number;

  @ApiProperty({ description: 'Number of total appointments' })
  totalAppointments: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

// ===================== PLATFORM STATISTICS DTOs =====================

export class PlatformStatsDto {
  @ApiProperty({ description: 'Total number of hospitals' })
  totalHospitals: number;

  @ApiProperty({ description: 'Total number of active users' })
  totalActiveUsers: number;

  @ApiProperty({ description: 'Total number of appointments this month' })
  monthlyAppointments: number;

  @ApiProperty({ description: 'Total platform revenue this month (in cents)' })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Platform growth percentage' })
  growthPercentage: number;

  @ApiProperty({ description: 'Average appointments per hospital' })
  avgAppointmentsPerHospital: number;

  @ApiProperty({ description: 'System uptime percentage' })
  systemUptime: number;

  @ApiProperty({ description: 'Active hospitals in last 30 days' })
  activeHospitalsLast30Days: number;

  @ApiProperty({ description: 'New users this month' })
  newUsersThisMonth: number;

  @ApiProperty({ description: 'Top performing hospitals by appointment count' })
  topHospitals: string[];

  @ApiProperty({
    description: 'Hospital status breakdown',
    example: {
      active: 10,
      inactive: 2,
      suspended: 1,
      pending: 0,
    },
  })
  hospitalStatusBreakdown: {
    active: number;
    inactive: number;
    suspended: number;
    pending: number;
  };

  @ApiProperty({
    description: 'Real platform usage metrics',
    example: {
      totalPatients: 250,
      totalProviders: 45,
      consultations: 120,
      followUps: 80,
      emergencies: 15,
      completedAppointments: 180,
    },
  })
  featureUsage: {
    totalPatients: number;
    totalProviders: number;
    consultations: number;
    followUps: number;
    emergencies: number;
    completedAppointments: number;
  };
}

// ===================== SYSTEM CONFIGURATION DTOs =====================

export class SystemConfigDto {
  @ApiProperty({ description: 'Configuration ID' })
  configId: string;

  @ApiProperty({ description: 'Platform maintenance mode status' })
  maintenanceMode: boolean;

  @ApiProperty({ description: 'Maintenance message for users' })
  maintenanceMessage?: string;

  @ApiProperty({ description: 'Maximum file upload size in MB' })
  maxFileUploadSize: number;

  @ApiProperty({ description: 'Default session timeout in minutes' })
  sessionTimeout: number;

  @ApiProperty({ description: 'Password policy configuration' })
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };

  @ApiProperty({ description: 'Email configuration' })
  emailConfig: {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };

  @ApiProperty({ description: 'Feature flags for the platform' })
  featureFlags: Record<string, boolean>;

  @ApiProperty({ description: 'Rate limiting configuration' })
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };

  @ApiProperty({ description: 'Backup configuration' })
  backupConfig: {
    enabled: boolean;
    frequency: string;
    retention: number;
  };
}

export class UpdateSystemConfigDto {
  @ApiProperty({
    description: 'Platform maintenance mode status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiProperty({
    description: 'Maintenance message for users',
    required: false,
  })
  @IsOptional()
  @IsString()
  maintenanceMessage?: string;

  @ApiProperty({
    description: 'Maximum file upload size in MB',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxFileUploadSize?: number;

  @ApiProperty({
    description: 'Default session timeout in minutes',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @ApiProperty({
    description: 'Password policy configuration',
    required: false,
  })
  @IsOptional()
  @IsObject()
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };

  @ApiProperty({
    description: 'Feature flags for the platform',
    required: false,
  })
  @IsOptional()
  @IsObject()
  featureFlags?: Record<string, boolean>;

  @ApiProperty({ description: 'Rate limiting configuration', required: false })
  @IsOptional()
  @IsObject()
  rateLimiting?: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
}

// ===================== USER MANAGEMENT DTOs =====================

export class UserManagementDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'User status' })
  status: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId: string;

  @ApiProperty({ description: 'Tenant name' })
  tenantName: string;

  @ApiProperty({ description: 'Last login timestamp' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Total appointments' })
  totalAppointments: number;

  @ApiProperty({ description: 'Account verification status' })
  isVerified: boolean;
}

// ===================== AUDIT LOG DTOs =====================

export class AuditLogDto {
  @ApiProperty({ description: 'Audit log ID' })
  logId: string;

  @ApiProperty({ description: 'Action performed' })
  action: string;

  @ApiProperty({ description: 'Resource type affected' })
  resourceType: string;

  @ApiProperty({ description: 'Resource ID affected' })
  resourceId?: string;

  @ApiProperty({ description: 'User who performed the action' })
  userId?: string;

  @ApiProperty({ description: 'User email' })
  userEmail?: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId?: string;

  @ApiProperty({ description: 'Tenant name' })
  tenantName?: string;

  @ApiProperty({ description: 'IP address' })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent' })
  userAgent?: string;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Timestamp of the action' })
  timestamp: Date;

  @ApiProperty({ description: 'Action result (success/failure)' })
  result: string;

  @ApiProperty({ description: 'Error message if action failed' })
  errorMessage?: string;
}
