import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { MedicalRecordController } from './controllers/medical-record.controller';
import { AIConfigController } from './controllers/ai-config.controller';
import { MedicalRecordService } from './services/medical-record.service';
import { AIConfigService } from './services/ai-config.service';
import { WebRTCService } from './services/webrtc.service';
import { Appointment } from './entities/appointment.entity';
import { MedicalRecord } from './entities/medical-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment, 
      MedicalRecord,
    ])
  ],
  controllers: [
    AppointmentsController,
    MedicalRecordController,
    AIConfigController,
  ],
  providers: [
    AppointmentsService,
    MedicalRecordService,
    AIConfigService,
    WebRTCService,
  ],
  exports: [
    AppointmentsService,
    MedicalRecordService,
    AIConfigService,
    WebRTCService,
  ],
})
export class AppointmentsModule {}
