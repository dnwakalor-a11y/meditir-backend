import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findById(patientId: string, tenantId: string): Promise<Patient | null> {
    return this.patientsRepository.findOne({
      where: { patientId, tenantId },
      relations: ['user', 'tenant'],
    });
  }

  async findByUserId(
    userId: string,
    tenantId: string,
  ): Promise<Patient | null> {
    return this.patientsRepository.findOne({
      where: { userId, tenantId },
      relations: ['user', 'tenant'],
    });
  }

  async findByTenant(tenantId: string): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { tenantId },
      relations: ['user'],
    });
  }

  async findByTenantWithPagination(
    tenantId: string,
    skip: number,
    take: number,
    search?: string,
  ): Promise<{ patients: Patient[]; total: number }> {
    const query = this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .where('patient.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR patient.medicalRecordNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [patients, total] = await query
      .orderBy('patient.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { patients, total };
  }

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientsRepository.create(patientData);
    return this.patientsRepository.save(patient);
  }

  async update(
    patientId: string,
    tenantId: string,
    updateData: Partial<Patient>,
  ): Promise<Patient> {
    const patient = await this.findById(patientId, tenantId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    Object.assign(patient, updateData);
    return this.patientsRepository.save(patient);
  }

  async delete(patientId: string, tenantId: string): Promise<void> {
    const patient = await this.findById(patientId, tenantId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    await this.patientsRepository.remove(patient);
  }

  async getPatientsByProvider(
    providerId: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    // Get patients who have appointments with this provider
    const query = this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .innerJoin(
        'appointments',
        'appointment',
        'appointment.patientId = patient.patientId',
      )
      .where('patient.tenantId = :tenantId', { tenantId })
      .andWhere('appointment.providerId = :providerId', { providerId })
      .distinct(true)
      .orderBy('patient.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [patients, total] = await query.getManyAndCount();

    return {
      patients,
      total,
      page,
      limit,
    };
  }
}
