import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { PlatformAdminModule } from './modules/platform-admin/platform-admin.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { DomainsModule } from './modules/domains/domains.module';
import { EmailModule } from './modules/email/email.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TenantSubdomainMiddleware } from './common/middleware/tenant-subdomain.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    RbacModule,
    SystemConfigModule,
    EmailModule,
    UsersModule,
    TenantsModule,
    PatientsModule,
    ProvidersModule,
    AppointmentsModule,
    PlatformAdminModule,
    DomainsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantSubdomainMiddleware).forRoutes('*'); // Apply to all routes
  }
}
