import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DoctorController } from './doctor.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/user.entity';
import { Patient } from '../patients/patient.entity';
import { Provider } from '../providers/provider.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Message } from '../messages/message.entity';
import { PatientsService } from '../patients/patients.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Patient,
      Provider,
      Appointment,
      Message,
    ]),
  ],
  controllers: [DashboardController, DoctorController],
  providers: [DashboardService, PatientsService, UsersService],
  exports: [DashboardService],
})
export class DashboardModule {}