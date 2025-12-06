import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Permission,
  PermissionCategory,
  PermissionAction,
} from './permission.entity';
import { Role, RoleType } from './role.entity';

@Injectable()
export class RbacSeedService {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async seedPermissions(): Promise<void> {
    this.logger.log('Starting permission seeding...');

    const permissions = [
      // USER MANAGEMENT
      {
        name: 'user:create',
        description: 'Create new users',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.CREATE,
        resource: 'user',
        isActive: true,
      },
      {
        name: 'user:read',
        description: 'View user information',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.READ,
        resource: 'user',
        isActive: true,
      },
      {
        name: 'user:update',
        description: 'Update user information',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.UPDATE,
        resource: 'user',
        isActive: true,
      },
      {
        name: 'user:delete',
        description: 'Delete users',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.DELETE,
        resource: 'user',
        isActive: true,
      },
      {
        name: 'user:manage',
        description: 'Manage user accounts (suspend/activate)',
        category: PermissionCategory.USER_MANAGEMENT,
        action: PermissionAction.MANAGE,
        resource: 'user',
        isActive: true,
      },

      // PATIENT CARE
      {
        name: 'patient:create',
        description: 'Create patient records',
        category: PermissionCategory.PATIENT_CARE,
        action: PermissionAction.CREATE,
        resource: 'patient',
        isActive: true,
      },
      {
        name: 'patient:read',
        description: 'View patient records',
        category: PermissionCategory.PATIENT_CARE,
        action: PermissionAction.READ,
        resource: 'patient',
        isActive: true,
      },
      {
        name: 'patient:update',
        description: 'Update patient records',
        category: PermissionCategory.PATIENT_CARE,
        action: PermissionAction.UPDATE,
        resource: 'patient',
        isActive: true,
      },
      {
        name: 'patient:delete',
        description: 'Delete patient records',
        category: PermissionCategory.PATIENT_CARE,
        action: PermissionAction.DELETE,
        resource: 'patient',
        isActive: true,
      },

      // APPOINTMENTS
      {
        name: 'appointment:create',
        description: 'Create appointments',
        category: PermissionCategory.APPOINTMENTS,
        action: PermissionAction.CREATE,
        resource: 'appointment',
        isActive: true,
      },
      {
        name: 'appointment:read',
        description: 'View appointments',
        category: PermissionCategory.APPOINTMENTS,
        action: PermissionAction.READ,
        resource: 'appointment',
        isActive: true,
      },
      {
        name: 'appointment:update',
        description: 'Update appointments',
        category: PermissionCategory.APPOINTMENTS,
        action: PermissionAction.UPDATE,
        resource: 'appointment',
        isActive: true,
      },
      {
        name: 'appointment:delete',
        description: 'Cancel appointments',
        category: PermissionCategory.APPOINTMENTS,
        action: PermissionAction.DELETE,
        resource: 'appointment',
        isActive: true,
      },
      {
        name: 'appointment:manage',
        description: 'Manage appointments (reschedule, etc.)',
        category: PermissionCategory.APPOINTMENTS,
        action: PermissionAction.MANAGE,
        resource: 'appointment',
        isActive: true,
      },

      // MEDICAL RECORDS
      {
        name: 'medical_record:create',
        description: 'Create medical records',
        category: PermissionCategory.MEDICAL_RECORDS,
        action: PermissionAction.CREATE,
        resource: 'medical_record',
        isActive: true,
      },
      {
        name: 'medical_record:read',
        description: 'View medical records',
        category: PermissionCategory.MEDICAL_RECORDS,
        action: PermissionAction.READ,
        resource: 'medical_record',
        isActive: true,
      },
      {
        name: 'medical_record:update',
        description: 'Update medical records',
        category: PermissionCategory.MEDICAL_RECORDS,
        action: PermissionAction.UPDATE,
        resource: 'medical_record',
        isActive: true,
      },

      // BILLING
      {
        name: 'billing:create',
        description: 'Create billing records',
        category: PermissionCategory.BILLING,
        action: PermissionAction.CREATE,
        resource: 'billing',
        isActive: true,
      },
      {
        name: 'billing:read',
        description: 'View billing information',
        category: PermissionCategory.BILLING,
        action: PermissionAction.READ,
        resource: 'billing',
        isActive: true,
      },
      {
        name: 'billing:update',
        description: 'Update billing records',
        category: PermissionCategory.BILLING,
        action: PermissionAction.UPDATE,
        resource: 'billing',
        isActive: true,
      },
      {
        name: 'billing:manage',
        description: 'Process payments and manage billing',
        category: PermissionCategory.BILLING,
        action: PermissionAction.MANAGE,
        resource: 'billing',
        isActive: true,
      },

      // SYSTEM ADMINISTRATION
      {
        name: 'system:read',
        description: 'View system information',
        category: PermissionCategory.SYSTEM,
        action: PermissionAction.READ,
        resource: 'system',
        isActive: true,
      },
      {
        name: 'system:manage',
        description: 'Manage system settings and maintenance',
        category: PermissionCategory.SYSTEM,
        action: PermissionAction.MANAGE,
        resource: 'system',
        isActive: true,
      },

      // PLATFORM ADMINISTRATION (Platform Admin only)
      {
        name: 'platform:tenant_management',
        description: 'Manage tenant/hospital accounts',
        category: PermissionCategory.PLATFORM_ADMIN,
        action: PermissionAction.MANAGE,
        resource: 'tenant',
        isActive: true,
      },
      {
        name: 'platform:user_management',
        description: 'Manage users across all tenants',
        category: PermissionCategory.PLATFORM_ADMIN,
        action: PermissionAction.MANAGE,
        resource: 'platform_user',
        isActive: true,
      },
      {
        name: 'platform:system_config',
        description: 'Manage platform-wide system configuration',
        category: PermissionCategory.PLATFORM_ADMIN,
        action: PermissionAction.MANAGE,
        resource: 'platform_config',
        isActive: true,
      },
      {
        name: 'platform:audit_logs',
        description: 'View platform audit logs',
        category: PermissionCategory.PLATFORM_ADMIN,
        action: PermissionAction.READ,
        resource: 'audit_log',
        isActive: true,
      },
      {
        name: 'platform:analytics',
        description: 'View platform analytics and reports',
        category: PermissionCategory.PLATFORM_ADMIN,
        action: PermissionAction.READ,
        resource: 'platform_analytics',
        isActive: true,
      },

      // TENANT ADMINISTRATION
      {
        name: 'tenant:manage',
        description: 'Manage tenant settings and configuration',
        category: PermissionCategory.TENANT_ADMIN,
        action: PermissionAction.MANAGE,
        resource: 'tenant_config',
        isActive: true,
      },

      // REPORTING & ANALYTICS
      {
        name: 'reports:generate',
        description: 'Generate reports',
        category: PermissionCategory.REPORTS,
        action: PermissionAction.CREATE,
        resource: 'report',
        isActive: true,
      },
      {
        name: 'reports:read',
        description: 'View reports',
        category: PermissionCategory.REPORTS,
        action: PermissionAction.READ,
        resource: 'report',
        isActive: true,
      },

      // MESSAGING/COMMUNICATION
      {
        name: 'messaging:create',
        description: 'Send messages',
        category: PermissionCategory.MESSAGING,
        action: PermissionAction.CREATE,
        resource: 'message',
        isActive: true,
      },
      {
        name: 'messaging:read',
        description: 'Read messages',
        category: PermissionCategory.MESSAGING,
        action: PermissionAction.READ,
        resource: 'message',
        isActive: true,
      },
      {
        name: 'messaging:manage',
        description: 'Manage communication settings',
        category: PermissionCategory.MESSAGING,
        action: PermissionAction.MANAGE,
        resource: 'communication',
        isActive: true,
      },
    ];

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        this.logger.log(`Created permission: ${permissionData.name}`);
      }
    }

    this.logger.log('Permission seeding completed');
  }

  async seedRoles(): Promise<void> {
    this.logger.log('Starting role seeding...');

    // Get all permissions
    const allPermissions = await this.permissionRepository.find();

    // Platform Admin role (has all permissions)
    await this.createRoleIfNotExists(
      'Platform Admin',
      'Platform administrator with full system access',
      RoleType.SYSTEM,
      null,
      allPermissions,
    );

    // Tenant Admin role (hospital-specific admin permissions)
    const tenantAdminPermissions = allPermissions.filter(
      (p) => p.category !== PermissionCategory.PLATFORM_ADMIN,
    );
    await this.createRoleIfNotExists(
      'Tenant Admin',
      'Hospital administrator with full tenant access',
      RoleType.SYSTEM,
      null,
      tenantAdminPermissions,
    );

    // Doctor role
    const doctorPermissions = allPermissions.filter(
      (p) =>
        [
          PermissionCategory.PATIENT_CARE,
          PermissionCategory.APPOINTMENTS,
          PermissionCategory.MEDICAL_RECORDS,
          PermissionCategory.MESSAGING,
          PermissionCategory.REPORTS,
        ].includes(p.category) && p.action !== PermissionAction.DELETE,
    );
    await this.createRoleIfNotExists(
      'Doctor',
      'Healthcare provider with patient care access',
      RoleType.SYSTEM,
      null,
      doctorPermissions,
    );

    // Nurse role
    const nursePermissions = allPermissions.filter(
      (p) =>
        [
          PermissionCategory.PATIENT_CARE,
          PermissionCategory.APPOINTMENTS,
          PermissionCategory.MESSAGING,
        ].includes(p.category) &&
        p.action !== PermissionAction.DELETE &&
        p.name !== 'medical_record:create',
    );
    await this.createRoleIfNotExists(
      'Nurse',
      'Nursing staff with patient support access',
      RoleType.SYSTEM,
      null,
      nursePermissions,
    );

    // Receptionist role
    const receptionistPermissions = allPermissions.filter(
      (p) =>
        [
          PermissionCategory.APPOINTMENTS,
          PermissionCategory.USER_MANAGEMENT,
          PermissionCategory.MESSAGING,
        ].includes(p.category) &&
        (p.action === PermissionAction.READ ||
          p.action === PermissionAction.CREATE ||
          p.action === PermissionAction.UPDATE ||
          p.resource === 'appointment' ||
          p.resource === 'message'),
    );
    await this.createRoleIfNotExists(
      'Receptionist',
      'Reception staff with appointment and user management',
      RoleType.SYSTEM,
      null,
      receptionistPermissions,
    );

    // Patient role
    const patientPermissions = allPermissions.filter(
      (p) =>
        p.name.includes('appointment:read') ||
        p.name.includes('appointment:create') ||
        p.name.includes('appointment:update') ||
        p.name.includes('medical_record:read') ||
        p.name.includes('messaging:create') ||
        p.name.includes('messaging:read'),
    );
    await this.createRoleIfNotExists(
      'Patient',
      'Patient with access to their own records and appointments',
      RoleType.SYSTEM,
      null,
      patientPermissions,
    );

    this.logger.log('Role seeding completed');
  }

  private async createRoleIfNotExists(
    name: string,
    description: string,
    type: RoleType,
    tenantId: string | null,
    permissions: Permission[],
  ): Promise<Role> {
    // Handle the nullable tenantId in the query
    const whereCondition = tenantId
      ? { name, tenantId }
      : { name, tenantId: null };

    let role = await this.roleRepository.findOne({
      where: whereCondition as any,
      relations: ['permissions'],
    });

    if (!role) {
      role = this.roleRepository.create({
        name,
        description,
        type,
        tenantId: tenantId || undefined, // Convert null to undefined for TypeORM
        isActive: true,
        permissions,
      });
      role = await this.roleRepository.save(role);
      this.logger.log(`Created role: ${name}`);
    } else {
      // Update permissions if role exists
      role.permissions = permissions;
      role = await this.roleRepository.save(role);
      this.logger.log(`Updated permissions for role: ${name}`);
    }

    return role;
  }

  async seedAll(): Promise<void> {
    this.logger.log('Starting complete RBAC seeding...');
    await this.seedPermissions();
    await this.seedRoles();
    this.logger.log('Complete RBAC seeding finished');
  }
}
