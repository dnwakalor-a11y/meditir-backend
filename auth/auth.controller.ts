import {
  Controller,
  Post,
  Body,
  Headers,
  Get,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  RefreshTokenDto,
  TokenResponseDto,
  UserProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ValidateResetTokenDto,
  TwoFALoginResponseDto,
  LoginWith2FADto,
  Complete2FALoginDto,
} from './dto/auth.dto';
import { VerifyOtpDto } from '../modules/auth/dto/otp.dto';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. For multi-tenant login, include x-tenant-subdomain header.',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant authentication',
    required: false,
    example: 'medzen-hospital',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Login successful - returns access token, refresh token, and user profile',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or unauthorized access',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-tenant-subdomain') tenantSubdomain?: string,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto, tenantSubdomain);
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user account with specified role and tenant',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Registration successful - returns access token, refresh token, and user profile',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or user already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'User already exists in this tenant',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate a new access token using a valid refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid refresh token' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieve the profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async getProfile(@CurrentUser() user: any): Promise<UserProfileDto> {
    return {
      userId: user.userId,
      email: user.email,
      firstName: user.user.firstName,
      lastName: user.user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      lastLoginAt: user.user.lastLoginAt,
      createdAt: user.user.createdAt,
      updatedAt: user.user.updatedAt,
    };
  }

  @Public()
  @Post('setup-platform-admin')
  @ApiOperation({
    summary: 'Setup initial platform administrator',
    description:
      'Creates the first platform administrator. Can only be called once when no platform admin exists.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Platform admin created successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Platform admin already exists or invalid data',
  })
  async setupPlatformAdmin(
    @Body() setupDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.setupPlatformAdmin(setupDto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Send password reset email to user. For multi-tenant users, include x-tenant-subdomain header.',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant password reset',
    required: false,
    example: 'medzen-hospital',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'User email address',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent (if user exists)',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset email sent if user exists',
        },
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Headers('x-tenant-subdomain') tenantSubdomain?: string,
  ): Promise<{ message: string }> {
    console.log('Forgot password request received:', {
      email: forgotPasswordDto.email,
      tenantSubdomain,
      headers: Object.keys(arguments[2] || {}),
    });
    await this.authService.requestPasswordReset(
      forgotPasswordDto.email,
      tenantSubdomain,
    );
    return { message: 'Password reset email sent if user exists' };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using reset token',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant applications',
    required: false,
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset token and new password',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers('x-tenant-subdomain') tenantSubdomain?: string,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      tenantSubdomain,
    );
    return { message: 'Password reset successfully' };
  }

  @Public()
  @Post('validate-reset-token')
  @ApiOperation({
    summary: 'Validate password reset token',
    description: 'Check if a password reset token is valid and not expired',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant applications',
    required: false,
  })
  @ApiBody({
    type: ValidateResetTokenDto,
    description: 'Reset token to validate',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
      },
    },
  })
  async validateResetToken(
    @Body() validateTokenDto: ValidateResetTokenDto,
    @Headers('x-tenant-subdomain') tenantSubdomain?: string,
  ): Promise<{ valid: boolean }> {
    const valid = await this.authService.validateResetToken(
      validateTokenDto.token,
      tenantSubdomain,
    );
    return { valid };
  }

  @Public()
  @Post('2fa/login')
  @ApiOperation({
    summary: 'Initiate 2FA login',
    description:
      'Start two-factor authentication login process by sending OTP to email',
  })
  @ApiHeader({
    name: 'x-tenant-subdomain',
    description: 'Tenant subdomain for multi-tenant authentication',
    required: false,
    example: 'medzen-hospital',
  })
  @ApiBody({
    type: LoginWith2FADto,
    description: 'User credentials for 2FA login',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP sent successfully - returns verification token',
    type: TwoFALoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async login2FA(
    @Body() loginWith2FADto: LoginWith2FADto,
    @Headers('x-tenant-subdomain') tenantSubdomain?: string,
  ): Promise<TwoFALoginResponseDto> {
    return this.authService.loginWith2FA(loginWith2FADto, tenantSubdomain);
  }

  @Public()
  @Post('2fa/verify')
  @ApiOperation({
    summary: 'Complete 2FA login',
    description: 'Complete two-factor authentication by verifying OTP code',
  })
  @ApiBody({
    type: Complete2FALoginDto,
    description: 'OTP verification details',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Login successful - returns access token, refresh token, and user profile',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid OTP or verification token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid or expired OTP' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async verify2FA(
    @Body() complete2FADto: Complete2FALoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.complete2FALogin(complete2FADto);
  }
}
