import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from './controllers/appointment.controller';
import { MedicalRecordController } from './controllers/medical-record.controller';
import { AppointmentService } from './services/appointment.service';
import { WebRTCService } from './services/webrtc.service';
import { MedicalRecordService } from './services/medical-record.service';
import { Appointment } from './entities/appointment.entity';
import { MedicalRecord } from './entities/medical-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      MedicalRecord,
    ]),
  ],
  controllers: [
    AppointmentController,
    MedicalRecordController,
  ],
  providers: [
    AppointmentService,
    WebRTCService,
    MedicalRecordService,
  ],
  exports: [
    AppointmentService,
    WebRTCService,
    MedicalRecordService,
  ],
})
export class AppointmentModule {}