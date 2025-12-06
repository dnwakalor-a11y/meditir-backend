import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { Patient } from '../patients/patient.entity';
import { Provider } from '../providers/provider.entity';
import { Appointment, AppointmentStatus, AppointmentType } from '../appointments/entities/appointment.entity';
import { Message } from '../messages/message.entity';
import { DashboardStatsDto, ProviderDashboardStatsDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getHospitalStats(tenantId: string): Promise<DashboardStatsDto> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      totalNurses,
      totalUsers,
      activeUsers,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
    ] = await Promise.all([
      this.patientRepository.count({ where: { tenantId } }),
      this.providerRepository.count({ 
        where: { tenantId },
        relations: ['user'],
      }).then(count => 
        this.providerRepository.count({
          where: { tenantId, user: { role: UserRole.DOCTOR } },
          relations: ['user']
        })
      ),
      this.providerRepository.count({ 
        where: { tenantId },
        relations: ['user'],
      }).then(count => 
        this.providerRepository.count({
          where: { tenantId, user: { role: UserRole.NURSE } },
          relations: ['user']
        })
      ),
      this.userRepository.count({ where: { tenantId } }),
      this.userRepository.count({ where: { tenantId, status: UserStatus.ACTIVE } }),
      this.appointmentRepository.count({
        where: {
          tenantId,
          scheduledAt: Between(startOfDay, endOfDay),
        },
      }),
      this.appointmentRepository.count({
        where: {
          tenantId,
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      this.appointmentRepository.count({
        where: {
          tenantId,
          status: AppointmentStatus.COMPLETED,
        },
      }),
    ]);

    return {
      totalPatients,
      totalDoctors,
      totalNurses,
      totalUsers,
      activeUsers,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
    };
  }

  async getProviderStats(providerId: string, tenantId: string): Promise<ProviderDashboardStatsDto> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalAppointments,
      todayAppointments,
      confirmedAppointments,
      virtualConsultations,
      upcomingAppointments,
      completedToday,
      totalPatients,
      newMessages,
    ] = await Promise.all([
      this.appointmentRepository.count({
        where: { providerId, tenantId },
      }),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          scheduledAt: Between(startOfDay, endOfDay),
        },
      }),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          type: AppointmentType.TELEMEDICINE,
        },
      }),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          scheduledAt: Between(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      this.appointmentRepository.count({
        where: {
          providerId,
          tenantId,
          scheduledAt: Between(startOfDay, endOfDay),
          status: AppointmentStatus.COMPLETED,
        },
      }),
      this.appointmentRepository
        .createQueryBuilder('appointment')
        .select('COUNT(DISTINCT appointment.patientId)', 'count')
        .where('appointment.providerId = :providerId', { providerId })
        .andWhere('appointment.tenantId = :tenantId', { tenantId })
        .getRawOne()
        .then(result => parseInt(result.count)),
      this.messageRepository.count({
        where: {
          tenantId,
          receiverId: providerId,
          readAt: IsNull(),
        },
      }),
    ]);

    return {
      totalAppointments,
      todayAppointments,
      confirmedAppointments,
      virtualConsultations,
      upcomingAppointments,
      completedToday,
      totalPatients,
      newMessages,
    };
  }
}