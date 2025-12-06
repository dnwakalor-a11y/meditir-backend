import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsArray, IsEnum } from 'class-validator';
import { RoleType } from '../role.entity';
import { PermissionCategory, PermissionAction } from '../permission.entity';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Custom Nurse',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Custom nurse role with specific permissions',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Whether this role is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether this role is assigned by default to new users',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class AssignRoleDto {
  @ApiProperty({
    description: 'Role ID to assign',
    example: 'uuid-role-id',
  })
  @IsString()
  roleId: string;

  @ApiProperty({
    description: 'Optional expiration date for temporary role assignment',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name',
    example: 'read:patient_records',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Read patient medical records',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Permission category',
    enum: PermissionCategory,
  })
  @IsEnum(PermissionCategory)
  category: PermissionCategory;

  @ApiProperty({
    description: 'Permission action',
    enum: PermissionAction,
  })
  @IsEnum(PermissionAction)
  action: PermissionAction;

  @ApiProperty({
    description: 'Resource this permission applies to',
    example: 'patient_records',
  })
  @IsString()
  resource: string;
}

export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID' })
  roleId: string;

  @ApiProperty({ description: 'Role name' })
  name: string;

  @ApiProperty({ description: 'Role description' })
  description: string;

  @ApiProperty({ description: 'Role type', enum: RoleType })
  type: RoleType;

  @ApiProperty({ description: 'Tenant ID (null for system roles)' })
  tenantId: string | null;

  @ApiProperty({ description: 'Whether role is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether role is default for new users' })
  isDefault: boolean;

  @ApiProperty({ description: 'Role permissions', type: 'array', items: { type: 'object' } })
  permissions?: any[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission ID' })
  permissionId: string;

  @ApiProperty({ description: 'Permission name' })
  name: string;

  @ApiProperty({ description: 'Permission description' })
  description: string;

  @ApiProperty({ description: 'Permission category', enum: PermissionCategory })
  category: PermissionCategory;

  @ApiProperty({ description: 'Permission action', enum: PermissionAction })
  action: PermissionAction;

  @ApiProperty({ description: 'Resource name' })
  resource: string;

  @ApiProperty({ description: 'Whether permission is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class UserRoleResponseDto {
  @ApiProperty({ description: 'User role assignment ID' })
  userRoleId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Role ID' })
  roleId: string;

  @ApiProperty({ description: 'Role assignment timestamp' })
  assignedAt: Date;

  @ApiProperty({ description: 'Role expiration timestamp (optional)' })
  expiresAt: Date | null;

  @ApiProperty({ description: 'User who assigned this role' })
  assignedBy: string;

  @ApiProperty({ description: 'Whether assignment is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Role details', type: RoleResponseDto })
  role?: RoleResponseDto;
}
