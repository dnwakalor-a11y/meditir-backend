import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { RbacModule } from '../rbac/rbac.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { EmailModule } from '../email/email.module';
import { DomainValidationService } from '../../common/services/domain-validation.service';
import { Patient } from '../patients/patient.entity';
import { Provider } from '../providers/provider.entity';
import { PasswordResetToken } from '../auth/password-reset-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, Appointment, Patient, Provider, PasswordResetToken]),
    RbacModule,
    SystemConfigModule,
    EmailModule,
  ],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService, DomainValidationService],
  exports: [PlatformAdminService],
})
export class PlatformAdminModule {}
