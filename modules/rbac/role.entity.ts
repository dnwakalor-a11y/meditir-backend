import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { Permission } from './permission.entity';

export enum RoleType {
  SYSTEM = 'system', // Platform-wide roles
  TENANT = 'tenant', // Tenant-specific roles
  CUSTOM = 'custom', // Custom roles created by tenant admins
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  roleId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'enum', enum: RoleType, nullable: false })
  type: RoleType;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string; // null for system roles

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean; // Whether this role is assigned by default to new users

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne('Tenant', 'roles', { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'roleId' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'permissionId' },
  })
  permissions: Permission[];

  @OneToMany('UserRole', 'role')
  userRoles: any[];
}
