import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../modules/users/users.module';
import { TenantsModule } from '../modules/tenants/tenants.module';
import { RbacModule } from '../modules/rbac/rbac.module';
import { EmailModule } from '../modules/email/email.module';
import { PasswordResetToken } from '../modules/auth/password-reset-token.entity';
import { Otp } from '../modules/auth/entities/otp.entity';
import { User } from '../modules/users/user.entity';
import { OtpService } from '../modules/auth/otp.service';
import { OtpController } from '../modules/auth/otp.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PasswordResetToken, Otp, User]),
    UsersModule,
    TenantsModule,
    RbacModule,
    EmailModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, OtpService],
  controllers: [AuthController, OtpController],
  exports: [AuthService, JwtAuthGuard, OtpService],
})
export class AuthModule {}
