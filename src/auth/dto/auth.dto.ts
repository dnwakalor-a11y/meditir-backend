import { IsEmail, IsString, MinLength, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../modules/users/user.entity';

export class LoginDto {
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
}

export class RegisterDto {
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
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    maxLength: 100,
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.PATIENT,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role: UserRole;

  @ApiProperty({
    description: 'Tenant subdomain for multi-tenancy',
    example: 'hospital-subdomain',
    maxLength: 255,
  })
  @IsString()
  tenantSubdomain: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}

export class UserProfileDto {
  @ApiProperty({ description: 'User unique identifier', format: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'User email address', format: 'email' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Tenant unique identifier', format: 'uuid' })
  tenantId: string;

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'abc123def456...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}

export class ValidateResetTokenDto {
  @ApiProperty({
    description: 'Password reset token to validate',
    example: 'abc123def456...',
  })
  @IsString()
  token: string;
}

export class LoginWith2FADto {
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
    description: 'Enable 2FA for this login',
    example: true,
  })
  @IsBoolean()
  enable2FA: boolean;
}

export class Complete2FALoginDto {
  @ApiProperty({
    description: '2FA verification token',
    example: 'verification-token-from-otp-verify',
  })
  @IsString()
  verificationToken: string;
}

export class TwoFALoginResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent to your email. Please verify to complete login.',
  })
  message: string;

  @ApiProperty({
    description: 'Indicates if 2FA is required',
    example: true,
  })
  require2FA: boolean;

  @ApiProperty({
    description: 'Masked email address',
    example: 'j***@example.com',
  })
  email: string;
}
