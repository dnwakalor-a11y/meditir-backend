import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

interface FindByTenantOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { userId },
      relations: ['tenant', 'patient', 'provider'],
    });
  }

  async findByIdWithRelations(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { userId },
      relations: ['tenant', 'patient', 'provider'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['tenant', 'patient', 'provider'],
    });
  }

  async findByEmailAndTenant(
    email: string,
    tenantId: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, tenantId },
      relations: ['tenant', 'patient', 'provider'],
    });
  }

  async findByTenant(
    tenantId?: string,
    options: FindByTenantOptions = {},
  ): Promise<User[]> {
    const { page = 1, limit = 10, role } = options;
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .leftJoinAndSelect('user.patient', 'patient')
      .leftJoinAndSelect('user.provider', 'provider');

    if (tenantId) {
      queryBuilder.where('user.tenantId = :tenantId', { tenantId });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(userId, { passwordHash });
  }

  async findPlatformAdmin(): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { role: UserRole.PLATFORM_ADMIN },
    });
  }

  async createWithInvite(
    userData: Partial<User> & { invitedByName: string; hospitalName: string },
  ): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async getPatientUsersByProvider(
    providerId: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    // Get patient users who have appointments with this provider
    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.patient', 'patient')
      .innerJoin('appointments', 'appointment', 'appointment.patientId = patient.patientId')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere('user.role = :role', { role: UserRole.PATIENT })
      .andWhere('appointment.providerId = :providerId', { providerId })
      .distinct(true)
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
    };
  }
}
