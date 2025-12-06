import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainController } from './domain.controller';
import { DomainValidationService } from '../../common/services/domain-validation.service';
import { Tenant } from '../tenants/tenant.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), TenantsModule],
  controllers: [DomainController],
  providers: [DomainValidationService],
  exports: [DomainValidationService],
})
export class DomainsModule {}
