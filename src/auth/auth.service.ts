import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../modules/users/users.service';
import { TenantsService } from '../modules/tenants/tenants.service';
import { RbacService } from '../modules/rbac/rbac.service';
import { EmailService } from '../modules/email/email.service';
import { PasswordResetToken } from '../modules/auth/password-reset-token.entity';
import { Otp, OtpType } from '../modules/auth/entities/otp.entity';
import { OtpService } from '../modules/auth/otp.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  LoginWith2FADto,
  Complete2FALoginDto,
} from './dto/auth.dto';
import { UserRole } from '../modules/users/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private rbacService: RbacService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private otpService: OtpService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async login(
    loginDto: LoginDto,
    tenantSubdomain?: string,
  ): Promise<AuthResponseDto> {
    let user;

    if (tenantSubdomain) {
      // Multi-tenant login
      const tenant = await this.tenantsService.findBySubdomain(tenantSubdomain);
      if (!tenant) {
        throw new UnauthorizedException('Invalid tenant');
      }

      user = await this.usersService.findByEmailAndTenant(
        loginDto.email,
        tenant.tenantId,
      );
    } else {
      // Platform admin login
      user = await this.usersService.findByEmail(loginDto.email);
      if (user && user.role !== UserRole.PLATFORM_ADMIN) {
        throw new UnauthorizedException('Platform admin access required');
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user.userId);

    return this.generateTokens(user);
  }

  async loginWith2FA(
    loginDto: LoginWith2FADto,
    tenantSubdomain?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string; require2FA: boolean; email: string }> {
    let user;

    if (tenantSubdomain) {
      // Multi-tenant login
      const tenant = await this.tenantsService.findBySubdomain(tenantSubdomain);
      if (!tenant) {
        throw new UnauthorizedException('Invalid tenant');
      }

      user = await this.usersService.findByEmailAndTenant(
        loginDto.email,
        tenant.tenantId,
      );
    } else {
      // Platform admin login
      user = await this.usersService.findByEmail(loginDto.email);
      if (user && user.role !== UserRole.PLATFORM_ADMIN) {
        throw new UnauthorizedException('Platform admin access required');
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (loginDto.enable2FA) {
      // Generate and send OTP
      await this.otpService.generateOtp(
        {
          email: loginDto.email,
          type: OtpType.TWO_FACTOR_AUTH,
        },
        ipAddress,
        userAgent,
        tenantSubdomain,
      );

      return {
        message: 'OTP sent to your email. Please verify to complete login.',
        require2FA: true,
        email: loginDto.email,
      };
    } else {
      // Regular login without 2FA
      await this.usersService.updateLastLogin(user.userId);
      const tokens = await this.generateTokens(user);
      return {
        message: 'Login successful',
        require2FA: false,
        email: loginDto.email,
        ...tokens,
      } as any;
    }
  }

  async complete2FALogin(
    complete2FADto: Complete2FALoginDto,
  ): Promise<AuthResponseDto> {
    // Verify the 2FA token
    const { userId } = await this.otpService.verify2FAToken(
      complete2FADto.verificationToken,
    );

    // Get user
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.userId);

    // Generate final auth tokens
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Find tenant by subdomain
    const tenant = await this.tenantsService.findBySubdomain(
      registerDto.tenantSubdomain,
    );
    if (!tenant) {
      throw new BadRequestException('Invalid tenant subdomain');
    }

    // Check if user already exists in this tenant
    const existingUser = await this.usersService.findByEmailAndTenant(
      registerDto.email,
      tenant.tenantId,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists in this tenant');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role as UserRole,
      tenantId: tenant.tenantId,
    });

    return this.generateTokens(user);
  }

  private async generateTokens(user: any): Promise<AuthResponseDto> {
    // Fetch user permissions
    const permissions = await this.rbacService.getUserPermissions(user.userId);

    const payload = {
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      permissions,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        userId: user.userId,
        tenantId: user.tenantId,
        role: user.role,
        permissions: [], // TODO: Implement RBAC permissions
        email: user.email,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async setupPlatformAdmin(setupDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if platform admin already exists
    const existingPlatformAdmin = await this.usersService.findPlatformAdmin();
    if (existingPlatformAdmin) {
      throw new BadRequestException('Platform administrator already exists');
    }

    // Create platform admin user
    const platformAdminData = {
      email: setupDto.email,
      password: setupDto.password,
      firstName: setupDto.firstName,
      lastName: setupDto.lastName,
      role: UserRole.PLATFORM_ADMIN,
      // tenantId will be undefined for platform admin
    };

    const user = await this.usersService.create(platformAdminData);

    // Assign Platform Admin role via RBAC
    const platformAdminRole =
      await this.rbacService.findRoleByName('Platform Admin');

    if (platformAdminRole) {
      await this.rbacService.assignRole(
        user.userId,
        platformAdminRole.roleId,
        user.userId, // Self-assigned
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async requestPasswordReset(
    email: string,
    tenantSubdomain?: string,
  ): Promise<void> {
    let user;

    if (tenantSubdomain) {
      // Multi-tenant password reset
      const tenant = await this.tenantsService.findBySubdomain(tenantSubdomain);
      if (!tenant) {
        // Don't reveal if tenant exists or not for security
        return;
      }
      user = await this.usersService.findByEmailAndTenant(
        email,
        tenant.tenantId,
      );
    } else {
      // Platform admin password reset
      user = await this.usersService.findByEmail(email);
      if (user && user.role !== UserRole.PLATFORM_ADMIN) {
        // Don't reveal if user exists or not for security
        return;
      }
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Remove any existing tokens for this user
    await this.passwordResetTokenRepository.delete({ userId: user.userId });

    // Create new reset token
    const passwordResetToken = this.passwordResetTokenRepository.create({
      token: resetToken,
      userId: user.userId,
      expiresAt,
      used: false,
    });

    await this.passwordResetTokenRepository.save(passwordResetToken);

    // Get hospital name if applicable
    let hospitalName: string | undefined;
    if (user.tenantId) {
      const tenant = await this.tenantsService.findById(user.tenantId);
      hospitalName = tenant?.name;
    }

    // Generate reset URL
    const baseUrl = this.configService.get<string>(
      'FRONTEND_BASE_URL',
      'http://localhost:3001',
    );
    const resetPasswordUrl = tenantSubdomain
      ? `https://${tenantSubdomain}.meditir.com/reset-password`
      : `${baseUrl}/reset-password`;

    this.logger.log(
      `Generated reset URL: ${resetPasswordUrl} for ${tenantSubdomain ? 'tenant: ' + tenantSubdomain : 'main domain'}`,
    );

    // Send password reset email
    this.logger.log(
      `Sending password reset email to ${user.email} with token: ${resetToken.substring(0, 8)}... and URL: ${resetPasswordUrl}`,
    );
    await this.emailService.sendPasswordResetEmail({
      userFirstName: user.firstName,
      userLastName: user.lastName,
      userEmail: user.email,
      resetToken,
      resetPasswordUrl,
      hospitalName,
    });
  }

  async resetPassword(
    token: string,
    newPassword: string,
    tenantSubdomain?: string,
  ): Promise<void> {
    // Find valid reset token
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, used: false },
      relations: ['user', 'user.tenant'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // If tenant subdomain is provided, validate that the user belongs to that tenant
    if (
      tenantSubdomain &&
      resetToken.user?.tenant?.subdomain !== tenantSubdomain
    ) {
      this.logger.warn(
        `Reset password failed: user tenant ${resetToken.user?.tenant?.subdomain} does not match expected tenant ${tenantSubdomain}`,
      );
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.usersService.updatePassword(resetToken.userId, passwordHash);

    // Mark token as used
    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);
  }

  async validateResetToken(
    token: string,
    tenantSubdomain?: string,
  ): Promise<boolean> {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, used: false },
      relations: ['user', 'user.tenant'],
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return false;
    }

    // If tenant subdomain is provided, validate that the user belongs to that tenant
    if (
      tenantSubdomain &&
      resetToken.user?.tenant?.subdomain !== tenantSubdomain
    ) {
      this.logger.warn(
        `Token validation failed: user tenant ${resetToken.user?.tenant?.subdomain} does not match expected tenant ${tenantSubdomain}`,
      );
      return false;
    }

    return true;
  }
}
