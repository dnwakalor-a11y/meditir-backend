import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsEnum, IsOptional } from 'class-validator';
import { OtpType } from '../entities/otp.entity';

export class GenerateOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'doctor@hospital.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Type of OTP',
    enum: OtpType,
    example: OtpType.TWO_FACTOR_AUTH,
  })
  @IsEnum(OtpType)
  type: OtpType;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'doctor@hospital.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description: 'Type of OTP',
    enum: OtpType,
    example: OtpType.TWO_FACTOR_AUTH,
  })
  @IsEnum(OtpType)
  type: OtpType;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'doctor@hospital.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Type of OTP',
    enum: OtpType,
    example: OtpType.TWO_FACTOR_AUTH,
  })
  @IsEnum(OtpType)
  type: OtpType;
}

export class OtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Time until OTP expires in seconds',
    example: 300,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Whether OTP was sent',
    example: true,
  })
  success: boolean;
}

export class OtpVerificationResponseDto {
  @ApiProperty({
    description: 'Verification result message',
    example: 'OTP verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether verification was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'User ID if verification successful',
    example: 'uuid-user-id',
    required: false,
  })
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Verification token for further authentication',
    example: 'verification-token',
    required: false,
  })
  @IsOptional()
  verificationToken?: string;
}