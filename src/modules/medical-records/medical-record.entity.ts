import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Patient } from '../patients/patient.entity';
import { Provider } from '../providers/provider.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

export enum MedicalRecordType {
  DIAGNOSIS = 'diagnosis',
  PRESCRIPTION = 'prescription',
  LAB_RESULT = 'lab_result',
  NOTE = 'note',
}

@Entity('medicalRecords')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  recordId: string;

  @Column({ type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ type: 'uuid', nullable: false })
  patientId: string;

  @Column({ type: 'uuid', nullable: false })
  providerId: string;

  @Column({ type: 'uuid', nullable: false })
  appointmentId: string;

  @Column({ type: 'enum', enum: MedicalRecordType, nullable: false })
  recordType: MedicalRecordType;

  @Column({ type: 'jsonb', nullable: false })
  content: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => Patient, (patient) => patient.patientId)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Provider, (provider) => provider.providerId)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @ManyToOne(() => Appointment, (appointment) => appointment.appointmentId)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;
}
