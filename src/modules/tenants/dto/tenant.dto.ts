import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsNumber,
  IsPositive,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Name of the hospital or clinic organization',
    example: 'MedZen General Hospital',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Unique subdomain for the tenant (used for white-labeling)',
    example: 'medzen-hospital',
    maxLength: 255,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Transform(({ value }) => value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
  subdomain: string;

  @ApiPropertyOptional({
    description: 'Phone number of the hospital',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Website URL of the hospital',
    example: 'https://www.hospitalmain.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the hospital',
    example: '123 Healthcare Avenue, Medical City, MC 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Timezone for the hospital',
    example: 'America/New_York',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of users allowed for this tenant',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'List of enabled features for the tenant',
    example: ['telemedicine', 'pharmacy', 'lab_results', 'appointment_scheduling'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];

  @ApiPropertyOptional({
    description: 'Branding configuration for white-labeling',
    example: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      logo: '/assets/logos/hospital.png',
      favicon: '/assets/favicons/hospital.ico',
      theme: 'light',
    },
  })
  @IsOptional()
  @IsObject()
  brandingConfig?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Default language for the tenant',
    example: 'en',
    default: 'en',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'Name of the hospital or clinic organization',
    example: 'MedZen General Hospital Updated',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the hospital',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Website URL of the hospital',
    example: 'https://www.hospitalmain.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the hospital',
    example: '123 Healthcare Avenue, Medical City, MC 12345',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Timezone for the hospital',
    example: 'America/New_York',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of users allowed for this tenant',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'List of enabled features for the tenant',
    example: ['telemedicine', 'pharmacy', 'lab_results', 'appointment_scheduling'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];

  @ApiPropertyOptional({
    description: 'Branding configuration for white-labeling',
    example: {
      primaryColor: '#28a745',
      secondaryColor: '#6c757d',
      logo: '/assets/logos/hospital-new.png',
      theme: 'dark',
    },
  })
  @IsOptional()
  @IsObject()
  brandingConfig?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Default language for the tenant',
    example: 'es',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;
}

export class TenantResponseDto {
  @ApiProperty({
    description: 'Unique tenant identifier',
    format: 'uuid',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Name of the hospital or clinic organization',
  })
  name: string;

  @ApiProperty({
    description: 'Unique subdomain for the tenant',
  })
  subdomain: string;

  @ApiPropertyOptional({
    description: 'Phone number of the hospital',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Website URL of the hospital',
  })
  website?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the hospital',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Timezone for the hospital',
  })
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of users allowed for this tenant',
  })
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'List of enabled features for the tenant',
  })
  enabledFeatures?: string[];

  @ApiPropertyOptional({
    description: 'Branding configuration for white-labeling',
  })
  brandingConfig?: Record<string, any>;

  @ApiProperty({
    description: 'Default language for the tenant',
  })
  language: string;

  @ApiProperty({
    description: 'Tenant creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
