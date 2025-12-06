import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

export enum PermissionCategory {
  USER_MANAGEMENT = 'user_management',
  PATIENT_CARE = 'patient_care',
  APPOINTMENTS = 'appointments',
  MEDICAL_RECORDS = 'medical_records',
  MESSAGING = 'messaging',
  BILLING = 'billing',
  PLATFORM_ADMIN = 'platform_admin',
  TENANT_ADMIN = 'tenant_admin',
  REPORTS = 'reports',
  SYSTEM = 'system',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  permissionId: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'enum', enum: PermissionCategory, nullable: false })
  category: PermissionCategory;

  @Column({ type: 'enum', enum: PermissionAction, nullable: false })
  action: PermissionAction;

  @Column({ type: 'varchar', length: 100, nullable: false })
  resource: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
