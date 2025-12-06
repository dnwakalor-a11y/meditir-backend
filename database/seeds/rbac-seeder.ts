import { DataSource } from 'typeorm';
import { Permission, PermissionCategory, PermissionAction } from '../../modules/rbac/permission.entity';
import { Role, RoleType } from '../../modules/rbac/role.entity';

export class RbacSeeder {
  constructor(private dataSource: DataSource) {}

  async seedPermissions(): Promise<Permission[]> {
    const permissionRepository = this.dataSource.getRepository(Permission);

    const permissions = [
      // User Management
      { name: 'create:users', description: 'Create new users', category: PermissionCategory.USER_MANAGEMENT, action: PermissionAction.CREATE, resource: 'users' },
      { name: 'read:users', description: 'Read user information', category: PermissionCategory.USER_MANAGEMENT, action: PermissionAction.READ, resource: 'users' },
      { name: 'update:users', description: 'Update user information', category: PermissionCategory.USER_MANAGEMENT, action: PermissionAction.UPDATE, resource: 'users' },
      { name: 'delete:users', description: 'Delete users', category: PermissionCategory.USER_MANAGEMENT, action: PermissionAction.DELETE, resource: 'users' },
      { name: 'manage:user_roles', description: 'Manage user role assignments', category: PermissionCategory.USER_MANAGEMENT, action: PermissionAction.MANAGE, resource: 'user_roles' },

      // Patient Care
      { name: 'create:patients', description: 'Create patient profiles', category: PermissionCategory.PATIENT_CARE, action: PermissionAction.CREATE, resource: 'patients' },
      { name: 'read:patients', description: 'Read patient information', category: PermissionCategory.PATIENT_CARE, action: PermissionAction.READ, resource: 'patients' },
      { name: 'update:patients', description: 'Update patient information', category: PermissionCategory.PATIENT_CARE, action: PermissionAction.UPDATE, resource: 'patients' },
      { name: 'read:own_patient_data', description: 'Read own patient data', category: PermissionCategory.PATIENT_CARE, action: PermissionAction.READ, resource: 'own_patient_data' },
      { name: 'update:own_patient_data', description: 'Update own patient data', category: PermissionCategory.PATIENT_CARE, action: PermissionAction.UPDATE, resource: 'own_patient_data' },

      // Medical Records
      { name: 'create:medical_records', description: 'Create medical records', category: PermissionCategory.MEDICAL_RECORDS, action: PermissionAction.CREATE, resource: 'medical_records' },
      { name: 'read:medical_records', description: 'Read medical records', category: PermissionCategory.MEDICAL_RECORDS, action: PermissionAction.READ, resource: 'medical_records' },
      { name: 'update:medical_records', description: 'Update medical records', category: PermissionCategory.MEDICAL_RECORDS, action: PermissionAction.UPDATE, resource: 'medical_records' },
      { name: 'delete:medical_records', description: 'Delete medical records', category: PermissionCategory.MEDICAL_RECORDS, action: PermissionAction.DELETE, resource: 'medical_records' },
      { name: 'read:own_medical_records', description: 'Read own medical records', category: PermissionCategory.MEDICAL_RECORDS, action: PermissionAction.READ, resource: 'own_medical_records' },

      // Appointments
      { name: 'create:appointments', description: 'Create appointments', category: PermissionCategory.APPOINTMENTS, action: PermissionAction.CREATE, resource: 'appointments' },
      { name: 'read:appointments', description: 'Read appointments', category: PermissionCategory.APPOINTMENTS, action: PermissionAction.READ, resource: 'appointments' },
      { name: 'update:appointments', description: 'Update appointments', category: PermissionCategory.APPOINTMENTS, action: PermissionAction.UPDATE, resource: 'appointments' },
      { name: 'delete:appointments', description: 'Cancel appointments', category: PermissionCategory.APPOINTMENTS, action: PermissionAction.DELETE, resource: 'appointments' },
      { name: 'read:own_appointments', description: 'Read own appointments', category: PermissionCategory.APPOINTMENTS, action: PermissionAction.READ, resource: 'own_appointments' },
      { name: 'manage:appointment_scheduling', description: 'Manage appointment scheduling', category: PermissionCategory.APPOINTMENTS, action: PermissionAction.MANAGE, resource: 'appointment_scheduling' },

      // Messaging
      { name: 'create:messages', description: 'Send messages', category: PermissionCategory.MESSAGING, action: PermissionAction.CREATE, resource: 'messages' },
      { name: 'read:messages', description: 'Read messages', category: PermissionCategory.MESSAGING, action: PermissionAction.READ, resource: 'messages' },
      { name: 'read:own_messages', description: 'Read own messages', category: PermissionCategory.MESSAGING, action: PermissionAction.READ, resource: 'own_messages' },

      // Billing
      { name: 'create:billing', description: 'Create billing records', category: PermissionCategory.BILLING, action: PermissionAction.CREATE, resource: 'billing' },
      { name: 'read:billing', description: 'Read billing information', category: PermissionCategory.BILLING, action: PermissionAction.READ, resource: 'billing' },
      { name: 'update:billing', description: 'Update billing information', category: PermissionCategory.BILLING, action: PermissionAction.UPDATE, resource: 'billing' },
      { name: 'manage:payments', description: 'Manage payments', category: PermissionCategory.BILLING, action: PermissionAction.MANAGE, resource: 'payments' },

      // Reports
      { name: 'read:reports', description: 'Read reports', category: PermissionCategory.REPORTS, action: PermissionAction.READ, resource: 'reports' },
      { name: 'create:reports', description: 'Create reports', category: PermissionCategory.REPORTS, action: PermissionAction.CREATE, resource: 'reports' },
      { name: 'export:reports', description: 'Export reports', category: PermissionCategory.REPORTS, action: PermissionAction.READ, resource: 'export_reports' },

      // Tenant Administration
      { name: 'manage:tenant_settings', description: 'Manage tenant settings', category: PermissionCategory.TENANT_ADMIN, action: PermissionAction.MANAGE, resource: 'tenant_settings' },
      { name: 'manage:tenant_users', description: 'Manage tenant users', category: PermissionCategory.TENANT_ADMIN, action: PermissionAction.MANAGE, resource: 'tenant_users' },
      { name: 'manage:tenant_roles', description: 'Manage tenant roles', category: PermissionCategory.TENANT_ADMIN, action: PermissionAction.MANAGE, resource: 'tenant_roles' },

      // Platform Administration
      { name: 'create:tenants', description: 'Create new tenants', category: PermissionCategory.PLATFORM_ADMIN, action: PermissionAction.CREATE, resource: 'tenants' },
      { name: 'read:all_tenants', description: 'Read all tenant information', category: PermissionCategory.PLATFORM_ADMIN, action: PermissionAction.READ, resource: 'all_tenants' },
      { name: 'update:tenants', description: 'Update tenant information', category: PermissionCategory.PLATFORM_ADMIN, action: PermissionAction.UPDATE, resource: 'tenants' },
      { name: 'delete:tenants', description: 'Delete tenants', category: PermissionCategory.PLATFORM_ADMIN, action: PermissionAction.DELETE, resource: 'tenants' },
      { name: 'manage:system_roles', description: 'Manage system-wide roles', category: PermissionCategory.PLATFORM_ADMIN, action: PermissionAction.MANAGE, resource: 'system_roles' },
      { name: 'manage:system_permissions', description: 'Manage system permissions', category: PermissionCategory.PLATFORM_ADMIN, action: PermissionAction.MANAGE, resource: 'system_permissions' },

      // System
      { name: 'read:system_health', description: 'Read system health status', category: PermissionCategory.SYSTEM, action: PermissionAction.READ, resource: 'system_health' },
      { name: 'manage:system_config', description: 'Manage system configuration', category: PermissionCategory.SYSTEM, action: PermissionAction.MANAGE, resource: 'system_config' },
    ];

    const savedPermissions: Permission[] = [];
    for (const permData of permissions) {
      const existingPermission = await permissionRepository.findOne({
        where: { name: permData.name },
      });

      if (!existingPermission) {
        const permission = permissionRepository.create(permData);
        savedPermissions.push(await permissionRepository.save(permission));
      } else {
        savedPermissions.push(existingPermission);
      }
    }

    return savedPermissions;
  }

  async seedRoles(permissions: Permission[]): Promise<Role[]> {
    const roleRepository = this.dataSource.getRepository(Role);

    // Helper function to find permissions by names
    const findPermissionsByNames = (names: string[]) => 
      permissions.filter(p => names.includes(p.name));

    const roles = [
      {
        name: 'Patient',
        description: 'Patient with access to own medical data',
        type: RoleType.SYSTEM,
        tenantId: null,
        isDefault: false,
        permissions: findPermissionsByNames([
          'read:own_patient_data',
          'update:own_patient_data',
          'read:own_medical_records',
          'read:own_appointments',
          'create:appointments',
          'update:appointments',
          'read:own_messages',
          'create:messages',
        ]),
      },
      {
        name: 'Doctor',
        description: 'Doctor with access to patient care and medical records',
        type: RoleType.SYSTEM,
        tenantId: null,
        isDefault: false,
        permissions: findPermissionsByNames([
          'read:patients',
          'update:patients',
          'create:medical_records',
          'read:medical_records',
          'update:medical_records',
          'read:appointments',
          'create:appointments',
          'update:appointments',
          'delete:appointments',
          'manage:appointment_scheduling',
          'read:messages',
          'create:messages',
          'read:billing',
          'create:billing',
          'update:billing',
        ]),
      },
      {
        name: 'Nurse',
        description: 'Nurse with limited patient care access',
        type: RoleType.SYSTEM,
        tenantId: null,
        isDefault: false,
        permissions: findPermissionsByNames([
          'read:patients',
          'update:patients',
          'read:medical_records',
          'create:medical_records',
          'update:medical_records',
          'read:appointments',
          'update:appointments',
          'read:messages',
          'create:messages',
        ]),
      },
      {
        name: 'Pharmacist',
        description: 'Pharmacist with prescription and medication access',
        type: RoleType.SYSTEM,
        tenantId: null,
        isDefault: false,
        permissions: findPermissionsByNames([
          'read:patients',
          'read:medical_records',
          'read:appointments',
          'read:messages',
          'create:messages',
        ]),
      },
      {
        name: 'Admin',
        description: 'Tenant administrator with full tenant management',
        type: RoleType.SYSTEM,
        tenantId: null,
        isDefault: false,
        permissions: findPermissionsByNames([
          'create:users',
          'read:users',
          'update:users',
          'delete:users',
          'manage:user_roles',
          'create:patients',
          'read:patients',
          'update:patients',
          'create:medical_records',
          'read:medical_records',
          'update:medical_records',
          'delete:medical_records',
          'create:appointments',
          'read:appointments',
          'update:appointments',
          'delete:appointments',
          'manage:appointment_scheduling',
          'read:messages',
          'create:messages',
          'create:billing',
          'read:billing',
          'update:billing',
          'manage:payments',
          'read:reports',
          'create:reports',
          'export:reports',
          'manage:tenant_settings',
          'manage:tenant_users',
          'manage:tenant_roles',
        ]),
      },
      {
        name: 'PlatformAdmin',
        description: 'Platform administrator with system-wide access',
        type: RoleType.SYSTEM,
        tenantId: null,
        isDefault: false,
        permissions: permissions, // All permissions
      },
    ];

    const savedRoles: Role[] = [];
    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name, type: roleData.type },
      });

      if (!existingRole) {
        const role = roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          type: roleData.type,
          tenantId: roleData.tenantId || undefined,
          isDefault: roleData.isDefault,
        });
        let savedRole = await roleRepository.save(role);
        
        // Add permissions to role
        if (roleData.permissions.length > 0) {
          savedRole.permissions = roleData.permissions;
          savedRole = await roleRepository.save(savedRole);
        }
        
        savedRoles.push(savedRole);
      } else {
        savedRoles.push(existingRole);
      }
    }

    return savedRoles;
  }

  async seed(): Promise<void> {
    console.log('🌱 Seeding RBAC permissions...');
    const permissions = await this.seedPermissions();
    console.log(`✅ Seeded ${permissions.length} permissions`);

    console.log('🌱 Seeding RBAC roles...');
    const roles = await this.seedRoles(permissions);
    console.log(`✅ Seeded ${roles.length} roles`);

    console.log('✅ RBAC seeding completed successfully');
  }
}
