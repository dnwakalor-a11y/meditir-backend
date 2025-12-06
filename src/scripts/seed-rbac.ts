import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacSeedService } from '../modules/rbac/rbac-seed.service';

async function bootstrap() {
  console.log('Starting RBAC seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const rbacSeedService = app.get(RbacSeedService);

  try {
    await rbacSeedService.seedAll();
    console.log('RBAC seeding completed successfully!');
  } catch (error) {
    console.error('RBAC seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
