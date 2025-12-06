import { DataSource } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { UserRole, UserStatus } from '../../modules/users/user.entity';
import * as bcrypt from 'bcryptjs';

export class PlatformAdminSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if platform admin already exists
    const existingAdmin = await userRepository.findOne({
      where: {
        email: 'admin@meditir.com',
        role: UserRole.PLATFORM_ADMIN,
      },
    });

    if (existingAdmin) {
      console.log('Platform admin user already exists');
      return;
    }

    // Create platform admin user
    const hashedPassword = await bcrypt.hash('PlatformAdmin123!', 10);

    const platformAdmin = userRepository.create({
      email: 'admin@meditir.com',
      firstName: 'Platform',
      lastName: 'Administrator',
      passwordHash: hashedPassword,
      role: UserRole.PLATFORM_ADMIN,
      status: UserStatus.ACTIVE,
      tenantId: '00000000-0000-0000-0000-000000000000', // Special UUID for platform admin
    });

    await userRepository.save(platformAdmin);

    console.log('Platform admin user created:');
    console.log('Email: admin@meditir.com');
    console.log('Password: PlatformAdmin123!');
    console.log('Role: Platform Admin');
  }
}
