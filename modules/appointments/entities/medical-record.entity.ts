import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/user.entity';
import { Tenant } from '../../tenants/tenant.entity';
import { Appointment } from './appointment.entity';

export enum RecordType {
  CONSULTATION = 'consultation',
  LAB_RESULT = 'lab_result',
  PRESCRIPTION = 'prescription',
  DIAGNOSIS = 'diagnosis',
  VACCINE = 'vaccine',
  SURGERY = 'surgery',
  IMAGING = 'imaging',
  VITAL_SIGNS = 'vital_signs',
}

export enum RecordStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

@Entity('medical_records')
export class MedicalRecord {
  @ApiProperty({ description: 'Medical record unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  recordId: string;

  @ApiProperty({ description: 'Patient ID' })
  @Column('uuid')
  patientId: string;

  @ApiProperty({ description: 'Provider ID who created the record' })
  @Column('uuid')
  providerId: string;

  @ApiProperty({ description: 'Associated appointment ID' })
  @Column('uuid', { nullable: true })
  appointmentId: string;

  @ApiProperty({ description: 'Record type', enum: RecordType })
  @Column({
    type: 'enum',
    enum: RecordType,
    default: RecordType.CONSULTATION,
  })
  type: RecordType;

  @ApiProperty({ description: 'Record status', enum: RecordStatus })
  @Column({
    type: 'enum',
    enum: RecordStatus,
    default: RecordStatus.ACTIVE,
  })
  status: RecordStatus;

  @ApiProperty({ description: 'Record title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Medical record content' })
  @Column('text')
  content: string;

  @ApiProperty({ description: 'Chief complaint' })
  @Column('text', { nullable: true })
  chiefComplaint: string;

  @ApiProperty({ description: 'History of present illness' })
  @Column('text', { nullable: true })
  historyOfPresentIllness: string;

  @ApiProperty({ description: 'Past medical history' })
  @Column('text', { nullable: true })
  pastMedicalHistory: string;

  @ApiProperty({ description: 'Current medications' })
  @Column('jsonb', { nullable: true })
  medications: any;

  @ApiProperty({ description: 'Allergies' })
  @Column('jsonb', { nullable: true })
  allergies: any;

  @ApiProperty({ description: 'Vital signs' })
  @Column('jsonb', { nullable: true })
  vitalSigns: any;

  @ApiProperty({ description: 'Physical examination findings' })
  @Column('text', { nullable: true })
  physicalExamination: string;

  @ApiProperty({ description: 'Assessment and diagnosis' })
  @Column('text', { nullable: true })
  assessment: string;

  @ApiProperty({ description: 'Treatment plan' })
  @Column('text', { nullable: true })
  treatmentPlan: string;

  @ApiProperty({ description: 'Follow-up instructions' })
  @Column('text', { nullable: true })
  followUpInstructions: string;

  @ApiProperty({ description: 'AI-generated insights' })
  @Column('text', { nullable: true })
  aiInsights: string;

  @ApiProperty({ description: 'AI-generated summary' })
  @Column('text', { nullable: true })
  aiSummary: string;

  @ApiProperty({ description: 'Lab results and attachments' })
  @Column('jsonb', { nullable: true })
  attachments: any;

  @ApiProperty({ description: 'Record tags for categorization' })
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty({ description: 'Record date' })
  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  recordDate: Date;

  @ApiProperty({ description: 'Tenant ID for multi-tenancy' })
  @Column('uuid')
  tenantId: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'providerId' })
  provider: User;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

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
  isActive(): boolean {
    return this.status === RecordStatus.ACTIVE;
  }

  isDraft(): boolean {
    return this.status === RecordStatus.DRAFT;
  }

  hasAIInsights(): boolean {
    return !!this.aiInsights || !!this.aiSummary;
  }
}