import { AppDataSource } from '../data-source';
import { Tenant } from '../../modules/tenants/tenant.entity';
import { User, UserRole } from '../../modules/users/user.entity';
import { Role } from '../../modules/rbac/role.entity';
import { UserRole as UserRoleEntity } from '../../modules/rbac/user-role.entity';
import { RbacSeeder } from './rbac-seeder';
import { PlatformAdminSeeder } from './platform-admin-seeder';
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Database connection established');

    const tenantRepository = AppDataSource.getRepository(Tenant);
    const userRepository = AppDataSource.getRepository(User);

    // Check if tenant already exists
    let savedTenant = await tenantRepository.findOne({
      where: { subdomain: 'medzen-hospital' },
    });

    if (!savedTenant) {
      // Create sample tenant
      const tenant = tenantRepository.create({
        name: 'MedZen General Hospital',
        subdomain: 'medzen-hospital',
        language: 'en',
        brandingConfig: {
          primaryColor: '#007bff',
          logo: '/assets/logos/medzen-hospital.png',
          theme: 'light',
        },
      });
      savedTenant = await tenantRepository.save(tenant);
      console.log('Sample tenant created:', savedTenant.name);
    } else {
      console.log('Sample tenant already exists:', savedTenant.name);
    }

    // Check if platform tenant exists (for platform admin)
    let platformTenant = await tenantRepository.findOne({
      where: { subdomain: 'platform' },
    });

    if (!platformTenant) {
      // Create platform tenant
      const platformTenantData = tenantRepository.create({
        name: 'Platform Administration',
        subdomain: 'platform',
        language: 'en',
        brandingConfig: {
          primaryColor: '#000000',
          logo: '/assets/logos/platform.png',
          theme: 'dark',
        },
      });
      platformTenant = await tenantRepository.save(platformTenantData);
      console.log('Platform tenant created');
    } else {
      console.log('Platform tenant already exists');
    }

    // Check if platform admin already exists
    let platformAdmin = await userRepository.findOne({
      where: {
        email: 'admin@meditir.com',
        role: UserRole.PLATFORM_ADMIN,
      },
    });

    if (!platformAdmin) {
      // Create platform admin with platform tenant ID
      const platformAdminPasswordHash = await bcrypt.hash(
        'PlatformAdmin123!',
        10,
      );
      platformAdmin = userRepository.create({
        email: 'admin@meditir.com',
        passwordHash: platformAdminPasswordHash,
        firstName: 'Platform',
        lastName: 'Admin',
        role: UserRole.PLATFORM_ADMIN,
        tenantId: platformTenant.tenantId, // Use actual platform tenant ID
      });
      await userRepository.save(platformAdmin);
      console.log('Platform admin created');
    } else {
      console.log('Platform admin already exists');
    }

    // Check if hospital admin already exists
    let hospitalAdmin = await userRepository.findOne({
      where: { email: 'admin@medzen-hospital.com' },
    });

    if (!hospitalAdmin) {
      // Create hospital admin
      const hospitalAdminPasswordHash = await bcrypt.hash('hospital123', 10);
      hospitalAdmin = userRepository.create({
        email: 'admin@medzen-hospital.com',
        passwordHash: hospitalAdminPasswordHash,
        firstName: 'Hospital',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        tenantId: savedTenant.tenantId,
      });
      await userRepository.save(hospitalAdmin);
      console.log('Hospital admin created');
    } else {
      console.log('Hospital admin already exists');
    }

    // Check if doctor already exists
    let doctor = await userRepository.findOne({
      where: { email: 'doctor@medzen-hospital.com' },
    });

    if (!doctor) {
      // Create sample doctor
      const doctorPasswordHash = await bcrypt.hash('doctor123', 10);
      doctor = userRepository.create({
        email: 'doctor@medzen-hospital.com',
        passwordHash: doctorPasswordHash,
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: UserRole.DOCTOR,
        tenantId: savedTenant.tenantId,
      });
      await userRepository.save(doctor);
      console.log('Sample doctor created');
    } else {
      console.log('Sample doctor already exists');
    }

    // Check if patient already exists
    let patient = await userRepository.findOne({
      where: { email: 'patient@example.com' },
    });

    if (!patient) {
      // Create sample patient
      const patientPasswordHash = await bcrypt.hash('patient123', 10);
      patient = userRepository.create({
        email: 'patient@example.com',
        passwordHash: patientPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PATIENT,
        tenantId: savedTenant.tenantId,
      });
      await userRepository.save(patient);
      console.log('Sample patient created');
    } else {
      console.log('Sample patient already exists');
    }

    // Seed RBAC data
    console.log('\n🌱 Starting RBAC seeding...');
    const rbacSeeder = new RbacSeeder(AppDataSource);
    await rbacSeeder.seed();

    // Now assign roles to users via RBAC system
    console.log('\n🔐 Assigning roles to users...');
    const roleRepository = AppDataSource.getRepository(Role);
    const userRoleRepository = AppDataSource.getRepository(UserRoleEntity);

    // Assign Admin role to hospital admin
    if (hospitalAdmin) {
      const adminRole = await roleRepository.findOne({
        where: { name: 'Admin' },
      });
      if (adminRole) {
        const existingUserRole = await userRoleRepository.findOne({
          where: { userId: hospitalAdmin.userId, roleId: adminRole.roleId },
        });
        if (!existingUserRole) {
          const hospitalAdminUserRole = userRoleRepository.create({
            userId: hospitalAdmin.userId,
            roleId: adminRole.roleId,
            assignedBy: hospitalAdmin.userId, // Self-assigned for seeding
            isActive: true,
          });
          await userRoleRepository.save(hospitalAdminUserRole);
          console.log('Admin role assigned to hospital admin');
        }
      }
    }

    // Assign Doctor role to doctor
    if (doctor) {
      const doctorRole = await roleRepository.findOne({
        where: { name: 'Doctor' },
      });
      if (doctorRole) {
        const existingUserRole = await userRoleRepository.findOne({
          where: { userId: doctor.userId, roleId: doctorRole.roleId },
        });
        if (!existingUserRole) {
          const doctorUserRole = userRoleRepository.create({
            userId: doctor.userId,
            roleId: doctorRole.roleId,
            assignedBy: hospitalAdmin?.userId || doctor.userId,
            isActive: true,
          });
          await userRoleRepository.save(doctorUserRole);
          console.log('Doctor role assigned to doctor');
        }
      }
    }

    // Assign Patient role to patient
    if (patient) {
      const patientRole = await roleRepository.findOne({
        where: { name: 'Patient' },
      });
      if (patientRole) {
        const existingUserRole = await userRoleRepository.findOne({
          where: { userId: patient.userId, roleId: patientRole.roleId },
        });
        if (!existingUserRole) {
          const patientUserRole = userRoleRepository.create({
            userId: patient.userId,
            roleId: patientRole.roleId,
            assignedBy: hospitalAdmin?.userId || patient.userId,
            isActive: true,
          });
          await userRoleRepository.save(patientUserRole);
          console.log('Patient role assigned to patient');
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\nSample credentials:');
    console.log('Platform Admin: admin@meditir.com / PlatformAdmin123!');
    console.log('Hospital Admin: admin@medzen-hospital.com / hospital123');
    console.log('Doctor: doctor@medzen-hospital.com / doctor123');
    console.log('Patient: patient@example.com / patient123');
    console.log('\nTenant subdomain: medzen-hospital');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
