import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThan } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(appointmentData);
    return this.appointmentRepository.save(appointment);
  }

  async find(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
    });
  }

  async findOneBy(criteria: any): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({
      where: criteria,
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
    });
  }

  async findByProvider(providerId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { providerId },
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patientId },
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByProviderAndDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        providerId,
        scheduledAt: Between(startDate, endDate),
      },
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async checkTimeSlotAvailability(
    providerId: string,
    scheduledAt: Date,
    durationMinutes: number = 30,
  ): Promise<boolean> {
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);

    const conflictingAppointments = await this.appointmentRepository.find({
      where: {
        providerId,
        scheduledAt: Between(
          new Date(scheduledAt.getTime() - durationMinutes * 60000),
          endTime,
        ),
      },
    });

    return conflictingAppointments.length === 0;
  }

  async update(criteria: any, updateData: Partial<Appointment>): Promise<void> {
    await this.appointmentRepository.update(criteria, updateData);
  }

  async delete(criteria: any): Promise<void> {
    await this.appointmentRepository.delete(criteria);
  }

  // Patient-specific methods
  async getPatientAppointments(
    patientId: string,
    tenantId: string,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patientId, tenantId },
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async cancelAppointment(
    appointmentId: string,
    tenantId: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId, tenantId },
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new Error('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed appointment');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepository.save(appointment);
  }
}
