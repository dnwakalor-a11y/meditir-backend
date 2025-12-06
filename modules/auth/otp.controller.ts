import {
  Controller,
  Post,
  Body,
  Headers,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from '@nestjs/common';
import { OtpService } from './otp.service';
import {
  GenerateOtpDto,
  VerifyOtpDto,
  ResendOtpDto,
  OtpResponseDto,
  OtpVerificationResponseDto,
} from './dto/otp.dto';

@ApiTags('OTP - Two Factor Authentication')
@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate OTP',
    description: 'Generate and send OTP code via email for two-factor authentication',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant applications',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP generated and sent successfully',
    type: OtpResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Too many OTP requests',
  })
  async generateOtp(
    @Body() generateOtpDto: GenerateOtpDto,
    @Headers('x-tenant-subdomain') tenantSubdomain: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
    @Request() req: any,
  ): Promise<OtpResponseDto> {
    return this.otpService.generateOtp(
      generateOtpDto,
      ipAddress,
      userAgent,
      tenantSubdomain,
    );
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verify the OTP code for two-factor authentication',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant applications',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: OtpVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid OTP code',
  })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Headers('x-tenant-subdomain') tenantSubdomain: string,
    @Ip() ipAddress: string,
  ): Promise<OtpVerificationResponseDto> {
    return this.otpService.verifyOtp(verifyOtpDto, ipAddress, tenantSubdomain);
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend OTP',
    description: 'Resend OTP code via email',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant applications',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    type: OtpResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Too many OTP requests',
  })
  async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,
    @Headers('x-tenant-subdomain') tenantSubdomain: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ipAddress: string,
  ): Promise<OtpResponseDto> {
    return this.otpService.resendOtp(
      resendOtpDto.email,
      resendOtpDto.type,
      ipAddress,
      userAgent,
      tenantSubdomain,
    );
  }
}