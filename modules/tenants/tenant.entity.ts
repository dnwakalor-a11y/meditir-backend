import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  tenantId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  subdomain: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone: string;

  @Column({ type: 'integer', nullable: true })
  maxUsers: number;

  @Column({ type: 'simple-array', nullable: true })
  enabledFeatures: string[];

  @Column({ type: 'jsonb', nullable: true })
  brandingConfig: Record<string, any>;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ 
    type: 'enum', 
    enum: TenantStatus, 
    default: TenantStatus.ACTIVE 
  })
  status: TenantStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany('Role', 'tenant')
  roles: any[];
}
