import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async findById(tenantId: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({
      where: { tenantId },
    });
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({
      where: { subdomain },
    });
  }

  async create(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantsRepository.create(tenantData);
    return this.tenantsRepository.save(tenant);
  }

  async update(tenantId: string, updateData: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    Object.assign(tenant, updateData);
    return this.tenantsRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find();
  }
}
