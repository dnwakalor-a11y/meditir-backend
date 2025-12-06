import { DataSource } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { Role } from '../../modules/rbac/role.entity';
import { UserRole } from '../../modules/rbac/user-role.entity';
import { UserRole as UserRoleEnum } from '../../modules/users/user.entity';

export async function updateUserPermissions(dataSource: DataSource) {
  console.log('🔄 Starting user permissions update...');

  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const userRoleRepository = dataSource.getRepository(UserRole);

  try {
    // Get all users who need role assignments
    const users = await userRepository.find({
      where: [
        { role: UserRoleEnum.ADMIN },
        { role: UserRoleEnum.DOCTOR },
        { role: UserRoleEnum.NURSE },
        { role: UserRoleEnum.PATIENT },
        { role: UserRoleEnum.PHARMACIST },
        { role: UserRoleEnum.PLATFORM_ADMIN },
      ],
    });

    console.log(`📊 Found ${users.length} users to process`);

    // Get all roles
    const roles = await roleRepository.find();
    const roleMap = new Map(roles.map((role) => [role.name, role]));

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if user already has role assignment
      const existingUserRole = await userRoleRepository.findOne({
        where: { userId: user.userId },
      });

      if (existingUserRole) {
        console.log(
          `⏭️  User ${user.email} already has role assignment, skipping`,
        );
        skippedCount++;
        continue;
      }

      // Map user role enum to role name
      let roleName: string;
      switch (user.role) {
        case UserRoleEnum.ADMIN:
          roleName = 'Admin';
          break;
        case UserRoleEnum.DOCTOR:
          roleName = 'Doctor';
          break;
        case UserRoleEnum.NURSE:
          roleName = 'Nurse';
          break;
        case UserRoleEnum.PATIENT:
          roleName = 'Patient';
          break;
        case UserRoleEnum.PHARMACIST:
          roleName = 'Pharmacist';
          break;
        case UserRoleEnum.PLATFORM_ADMIN:
          roleName = 'Platform Admin';
          break;
        default:
          console.log(
            `❌ Unknown role ${user.role} for user ${user.email}, skipping`,
          );
          skippedCount++;
          continue;
      }

      const role = roleMap.get(roleName);
      if (!role) {
        console.log(
          `❌ Role '${roleName}' not found for user ${user.email}, skipping`,
        );
        skippedCount++;
        continue;
      }

      // Create UserRole association
      const userRole = userRoleRepository.create({
        userId: user.userId,
        roleId: role.roleId,
        assignedBy: user.userId, // Self-assigned during migration
        assignedAt: new Date(),
      });

      await userRoleRepository.save(userRole);
      console.log(`✅ Assigned role '${roleName}' to user ${user.email}`);
      updatedCount++;
    }

    console.log(`\n📈 Update Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users`);
    console.log(`   📊 Total processed: ${users.length} users`);
    console.log('✨ User permissions update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating user permissions:', error);
    throw error;
  }
}
