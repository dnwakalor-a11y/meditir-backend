import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '../entities/appointment.entity';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  SaveConsultationNotesDto,
  TelemedicineAppointmentDto,
  AppointmentSummaryDto,
} from '../dto/appointment.dto';

interface AppointmentQuery {
  patientId?: string;
  providerId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  /**
   * Create a new appointment
   */
  async create(
    createAppointmentDto: CreateAppointmentDto,
    tenantId: string,
  ): Promise<Appointment> {
    this.logger.log(`Creating new appointment for tenant ${tenantId}`);

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      tenantId,
      status: AppointmentStatus.SCHEDULED,
    });

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Create a telemedicine appointment
   */
  async createTelemedicine(
    telemedicineDto: TelemedicineAppointmentDto,
    tenantId: string,
  ): Promise<Appointment> {
    this.logger.log(`Creating telemedicine appointment for tenant ${tenantId}`);

    const appointment = this.appointmentRepository.create({
      ...telemedicineDto,
      tenantId,
      type: AppointmentType.TELEMEDICINE,
      status: AppointmentStatus.SCHEDULED,
    });

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Get all appointments with filtering
   */
  async findAll(
    query: AppointmentQuery,
    tenantId: string,
  ): Promise<Appointment[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.provider', 'provider')
      .where('appointment.tenantId = :tenantId', { tenantId });

    // Apply filters
    if (query.patientId) {
      queryBuilder.andWhere('appointment.patientId = :patientId', {
        patientId: query.patientId,
      });
    }

    if (query.providerId) {
      queryBuilder.andWhere('appointment.providerId = :providerId', {
        providerId: query.providerId,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('appointment.status = :status', {
        status: query.status,
      });
    }

    if (query.type) {
      queryBuilder.andWhere('appointment.type = :type', { type: query.type });
    }

    if (query.startDate) {
      queryBuilder.andWhere('appointment.scheduledAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('appointment.scheduledAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    // Sorting
    queryBuilder.orderBy('appointment.scheduledAt', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Get appointment by ID
   */
  async findOne(appointmentId: string, tenantId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId, tenantId },
      relations: ['patient', 'provider'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  /**
   * Update appointment
   */
  async update(
    appointmentId: string,
    updateAppointmentDto: UpdateAppointmentDto,
    tenantId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(appointmentId, tenantId);

    Object.assign(appointment, updateAppointmentDto);

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Cancel appointment
   */
  async cancel(appointmentId: string, tenantId: string): Promise<Appointment> {
    const appointment = await this.findOne(appointmentId, tenantId);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    appointment.status = AppointmentStatus.CANCELLED;

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Complete appointment
   */
  async complete(
    appointmentId: string,
    tenantId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(appointmentId, tenantId);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Appointment is already completed');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete a cancelled appointment');
    }

    appointment.status = AppointmentStatus.COMPLETED;

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Save consultation notes
   */
  async saveConsultationNotes(
    appointmentId: string,
    notesDto: SaveConsultationNotesDto,
    tenantId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(appointmentId, tenantId);

    // Update appointment with consultation notes
    appointment.notes = notesDto.notes;

    if (notesDto.aiTranscript) {
      appointment.aiTranscript = notesDto.aiTranscript;
    }

    if (notesDto.aiSummary) {
      appointment.aiSummary = notesDto.aiSummary;
    }

    if (notesDto.prescription) {
      appointment.prescription = notesDto.prescription;
    }

    if (notesDto.diagnosis) {
      appointment.diagnosis = notesDto.diagnosis;
    }

    if (notesDto.followUpRecommendations) {
      appointment.followUpRecommendations = notesDto.followUpRecommendations;
    }

    if (notesDto.vitalSigns) {
      appointment.vitalSigns = notesDto.vitalSigns;
    }

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Get upcoming appointments for a provider
   */
  async getUpcomingForProvider(
    providerId: string,
    tenantId: string,
  ): Promise<Appointment[]> {
    const now = new Date();

    return await this.appointmentRepository.find({
      where: {
        providerId,
        tenantId,
        status: AppointmentStatus.SCHEDULED,
      },
      relations: ['patient'],
      order: {
        scheduledAt: 'ASC',
      },
    });
  }

  /**
   * Get today's appointments for a provider
   */
  async getTodaysAppointments(
    providerId: string,
    tenantId: string,
  ): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.providerId = :providerId', { providerId })
      .andWhere('appointment.tenantId = :tenantId', { tenantId })
      .andWhere('appointment.scheduledAt >= :startOfDay', { startOfDay })
      .andWhere('appointment.scheduledAt <= :endOfDay', { endOfDay })
      .orderBy('appointment.scheduledAt', 'ASC')
      .getMany();
  }

  /**
   * Get telemedicine appointments that can start a call
   */
  async getCallableAppointments(
    providerId: string,
    tenantId: string,
  ): Promise<Appointment[]> {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.providerId = :providerId', { providerId })
      .andWhere('appointment.tenantId = :tenantId', { tenantId })
      .andWhere('appointment.type = :type', {
        type: AppointmentType.TELEMEDICINE,
      })
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.SCHEDULED,
      })
      .andWhere('appointment.scheduledAt >= :startTime', {
        startTime: fifteenMinutesAgo,
      })
      .andWhere('appointment.scheduledAt <= :endTime', {
        endTime: thirtyMinutesFromNow,
      })
      .orderBy('appointment.scheduledAt', 'ASC')
      .getMany();
  }

  /**
   * Get appointment statistics for a provider
   */
  async getProviderStatistics(
    providerId: string,
    tenantId: string,
  ): Promise<any> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      totalAppointments,
      todayAppointments,
      monthlyAppointments,
      completedAppointments,
      cancelledAppointments,
      telemedicineAppointments,
    ] = await Promise.all([
      this.appointmentRepository.count({
        where: { providerId, tenantId },
      }),
      this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.providerId = :providerId', { providerId })
        .andWhere('appointment.tenantId = :tenantId', { tenantId })
        .andWhere('DATE(appointment.scheduledAt) = CURRENT_DATE')
        .getCount(),
      this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.providerId = :providerId', { providerId })
        .andWhere('appointment.tenantId = :tenantId', { tenantId })
        .andWhere('appointment.scheduledAt >= :startOfMonth', { startOfMonth })
        .getCount(),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          status: AppointmentStatus.COMPLETED,
        },
      }),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          status: AppointmentStatus.CANCELLED,
        },
      }),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          type: AppointmentType.TELEMEDICINE,
        },
      }),
    ]);

    return {
      total: totalAppointments,
      today: todayAppointments,
      thisMonth: monthlyAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      telemedicine: telemedicineAppointments,
      completionRate:
        totalAppointments > 0
          ? (completedAppointments / totalAppointments) * 100
          : 0,
    };
  }

  /**
   * Delete appointment (soft delete)
   */
  async remove(appointmentId: string, tenantId: string): Promise<void> {
    const appointment = await this.findOne(appointmentId, tenantId);
    await this.appointmentRepository.remove(appointment);
  }

  /**
   * Get appointments for a specific patient
   */
  async getPatientAppointments(
    patientId: string,
    tenantId: string,
  ): Promise<Appointment[]> {
    this.logger.log(
      `Getting appointments for patient ${patientId} in tenant ${tenantId}`,
    );

    return await this.appointmentRepository.find({
      where: {
        patientId,
        tenantId,
      },
      relations: ['provider', 'provider.user'],
      order: {
        scheduledAt: 'DESC',
      },
    });
  }

  /**
   * Cancel appointment by patient
   */
  async cancelAppointment(
    appointmentId: string,
    tenantId: string,
  ): Promise<Appointment> {
    this.logger.log(
      `Cancelling appointment ${appointmentId} in tenant ${tenantId}`,
    );

    const appointment = await this.findOne(appointmentId, tenantId);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return await this.appointmentRepository.save(appointment);
  }
}
