import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  patientId: string;

  @Column({ type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medicalRecordNumber: string;

  @Column({ type: 'date', nullable: false })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  insuranceInfo: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  medicalHistory: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  currentVitals: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToOne(() => User, (user) => user.patient)
  @JoinColumn({ name: 'userId' })
  user: User;
}
