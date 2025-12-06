import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/user.entity';
import { Tenant } from '../../tenants/tenant.entity';
import { Patient } from '../../patients/patient.entity';
import { Provider } from '../../providers/provider.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  TELEMEDICINE = 'telemedicine',
  IN_PERSON = 'in_person',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
}

export enum CallStatus {
  NOT_STARTED = 'not_started',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ENDED = 'ended',
  FAILED = 'failed',
}

@Entity('appointments')
export class Appointment {
  @ApiProperty({ description: 'Appointment unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  appointmentId: string;

  @ApiProperty({ description: 'Patient ID' })
  @Column('uuid')
  patientId: string;

  @ApiProperty({ description: 'Doctor/Provider ID' })
  @Column('uuid')
  providerId: string;

  @ApiProperty({ description: 'Appointment title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Appointment description' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ description: 'Appointment status', enum: AppointmentStatus })
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @ApiProperty({ description: 'Appointment type', enum: AppointmentType })
  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.TELEMEDICINE,
  })
  type: AppointmentType;

  @ApiProperty({ description: 'Scheduled date and time' })
  @Column('timestamp')
  scheduledAt: Date;

  @ApiProperty({ description: 'Appointment duration in minutes' })
  @Column('int', { default: 30 })
  durationMinutes: number;

  @ApiProperty({ description: 'Call status for telemedicine', enum: CallStatus })
  @Column({
    type: 'enum',
    enum: CallStatus,
    default: CallStatus.NOT_STARTED,
  })
  callStatus: CallStatus;

  @ApiProperty({ description: 'WebRTC room ID for video calls' })
  @Column({ nullable: true })
  roomId: string;

  @ApiProperty({ description: 'Call started timestamp' })
  @Column('timestamp', { nullable: true })
  callStartedAt: Date;

  @ApiProperty({ description: 'Call ended timestamp' })
  @Column('timestamp', { nullable: true })
  callEndedAt: Date;

  @ApiProperty({ description: 'Meeting notes and consultation summary' })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: 'AI-generated consultation transcript' })
  @Column('text', { nullable: true })
  aiTranscript: string;

  @ApiProperty({ description: 'AI-generated medical summary' })
  @Column('text', { nullable: true })
  aiSummary: string;

  @ApiProperty({ description: 'Prescription details' })
  @Column('jsonb', { nullable: true })
  prescription: any;

  @ApiProperty({ description: 'Diagnosis information' })
  @Column('jsonb', { nullable: true })
  diagnosis: any;

  @ApiProperty({ description: 'Follow-up recommendations' })
  @Column('text', { nullable: true })
  followUpRecommendations: string;

  @ApiProperty({ description: 'Patient vital signs during consultation' })
  @Column('jsonb', { nullable: true })
  vitalSigns: any;

  @ApiProperty({ description: 'Tenant ID for multi-tenancy' })
  @Column('uuid')
  tenantId: string;

  // Relations
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isTelemedicine(): boolean {
    return this.type === AppointmentType.TELEMEDICINE;
  }

  canStartCall(): boolean {
    return (
      this.isTelemedicine() &&
      this.status === AppointmentStatus.SCHEDULED &&
      this.callStatus === CallStatus.NOT_STARTED
    );
  }

  isCallActive(): boolean {
    return this.callStatus === CallStatus.ACTIVE;
  }

  canEndCall(): boolean {
    return this.callStatus === CallStatus.ACTIVE;
  }
}