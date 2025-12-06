import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { updateUserPermissions } from './update-user-permissions';

async function runUserPermissionsUpdate() {
  console.log('🚀 Starting user permissions update...');

  try {
    await AppDataSource.initialize();
    console.log('📊 Database connection established');

    await updateUserPermissions(AppDataSource);

    console.log('✨ User permissions update completed successfully!');
  } catch (error) {
    console.error('❌ Error during user permissions update:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

runUserPermissionsUpdate();
