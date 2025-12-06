import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Otp, OtpType, OtpStatus } from './entities/otp.entity';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import {
  GenerateOtpDto,
  VerifyOtpDto,
  OtpResponseDto,
  OtpVerificationResponseDto,
} from './dto/otp.dto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateOtp(
    generateOtpDto: GenerateOtpDto,
    ipAddress?: string,
    userAgent?: string,
    tenantSubdomain?: string,
  ): Promise<OtpResponseDto> {
    const { email, type } = generateOtpDto;

    // Find user by email and tenant
    let user: User | null;
    if (tenantSubdomain) {
      // Multi-tenant lookup - you'll need to implement this based on your tenant service
      user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .where('user.email = :email', { email })
        .andWhere('tenant.subdomain = :subdomain', { subdomain: tenantSubdomain })
        .getOne();
    } else {
      user = await this.userRepository.findOne({ where: { email } });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check rate limiting - max 3 OTPs per 5 minutes
    const recentOtps = await this.otpRepository.count({
      where: {
        userId: user.userId,
        type,
        createdAt: MoreThan(new Date(Date.now() - 5 * 60 * 1000)), // 5 minutes ago
      },
    });

    if (recentOtps >= 3) {
      throw new BadRequestException(
        'Too many OTP requests. Please wait before requesting another.',
      );
    }

    // Invalidate any existing pending OTPs for this user and type
    await this.otpRepository.update(
      {
        userId: user.userId,
        type,
        status: OtpStatus.PENDING,
      },
      {
        status: OtpStatus.EXPIRED,
      },
    );

    // Generate 6-digit OTP
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to database
    const otp = this.otpRepository.create({
      userId: user.userId,
      type,
      code,
      expiresAt,
      ipAddress,
      userAgent,
    });

    await this.otpRepository.save(otp);

    // Send OTP via email
    await this.sendOtpEmail(user, code, type);

    this.logger.log(`OTP generated for user ${user.userId} (${email})`);

    return {
      message: 'OTP sent successfully to your email',
      expiresIn: 300, // 5 minutes in seconds
      success: true,
    };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
    ipAddress?: string,
    tenantSubdomain?: string,
  ): Promise<OtpVerificationResponseDto> {
    const { email, code, type } = verifyOtpDto;

    // Find user by email and tenant
    let user: User | null;
    if (tenantSubdomain) {
      user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.tenant', 'tenant')
        .where('user.email = :email', { email })
        .andWhere('tenant.subdomain = :subdomain', { subdomain: tenantSubdomain })
        .getOne();
    } else {
      user = await this.userRepository.findOne({ where: { email } });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find the OTP
    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.userId,
        type,
        status: OtpStatus.PENDING,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!otp) {
      throw new BadRequestException('No valid OTP found');
    }

    // Check if OTP is expired
    if (otp.isExpired()) {
      otp.status = OtpStatus.EXPIRED;
      await this.otpRepository.save(otp);
      throw new BadRequestException('OTP has expired');
    }

    // Increment attempts
    otp.attempts += 1;
    await this.otpRepository.save(otp);

    // Check if max attempts exceeded
    if (otp.attempts > otp.maxAttempts) {
      otp.status = OtpStatus.EXPIRED;
      await this.otpRepository.save(otp);
      throw new BadRequestException('Maximum OTP attempts exceeded');
    }

    // Verify the code
    if (otp.code !== code) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Mark OTP as verified
    otp.status = OtpStatus.VERIFIED;
    otp.verifiedAt = new Date();
    await this.otpRepository.save(otp);

    // Generate verification token for 2FA
    let verificationToken: string | undefined;
    if (type === OtpType.TWO_FACTOR_AUTH) {
      verificationToken = this.jwtService.sign(
        {
          userId: user.userId,
          email: user.email,
          verified2FA: true,
          type: '2fa_verification',
        },
        {
          expiresIn: '10m', // Short-lived token for completing login
        },
      );
    }

    this.logger.log(`OTP verified successfully for user ${user.userId} (${email})`);

    return {
      message: 'OTP verified successfully',
      success: true,
      userId: user.userId,
      verificationToken,
    };
  }

  async resendOtp(
    email: string,
    type: OtpType,
    ipAddress?: string,
    userAgent?: string,
    tenantSubdomain?: string,
  ): Promise<OtpResponseDto> {
    return this.generateOtp(
      { email, type },
      ipAddress,
      userAgent,
      tenantSubdomain,
    );
  }

  private generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private async sendOtpEmail(user: User, code: string, type: OtpType): Promise<void> {
    const subject = this.getOtpEmailSubject(type);

    await this.emailService.sendEmail({
      to: user.email,
      subject,
      html: this.getOtpEmailHtml(user, code, type),
    });
  }

  private getOtpEmailSubject(type: OtpType): string {
    switch (type) {
      case OtpType.TWO_FACTOR_AUTH:
        return 'Your Two-Factor Authentication Code';
      case OtpType.EMAIL_VERIFICATION:
        return 'Verify Your Email Address';
      case OtpType.PASSWORD_RESET:
        return 'Password Reset Verification Code';
      default:
        return 'Your Verification Code';
    }
  }

  private getOtpEmailHtml(user: User, code: string, type: OtpType): string {
    const title = this.getOtpEmailSubject(type);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .otp-code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; padding: 15px; background-color: white; border: 2px dashed #007bff; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MedZen Hospital Portal</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName} ${user.lastName},</h2>
            <p>${this.getOtpEmailMessage(type)}</p>
            <div class="otp-code">${code}</div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from MedZen Hospital Portal.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOtpEmailMessage(type: OtpType): string {
    switch (type) {
      case OtpType.TWO_FACTOR_AUTH:
        return 'Please use the following code to complete your two-factor authentication:';
      case OtpType.EMAIL_VERIFICATION:
        return 'Please use the following code to verify your email address:';
      case OtpType.PASSWORD_RESET:
        return 'Please use the following code to reset your password:';
      default:
        return 'Please use the following verification code:';
    }
  }

  // Clean up expired OTPs (can be called by a cron job)
  async cleanupExpiredOtps(): Promise<void> {
    const result = await this.otpRepository.delete({
      expiresAt: MoreThan(new Date()),
      status: OtpStatus.EXPIRED,
    });

    this.logger.log(`Cleaned up ${result.affected} expired OTPs`);
  }

  // Verify 2FA token for subsequent requests
  async verify2FAToken(token: string): Promise<{ userId: string; email: string }> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== '2fa_verification' || !payload.verified2FA) {
        throw new UnauthorizedException('Invalid 2FA token');
      }

      return {
        userId: payload.userId,
        email: payload.email,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired 2FA token');
    }
  }
}