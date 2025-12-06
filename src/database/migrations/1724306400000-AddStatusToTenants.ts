import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusToTenants1724306400000 implements MigrationInterface {
  name = 'AddStatusToTenants1724306400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type first
    await queryRunner.query(`CREATE TYPE "tenant_status_enum" AS ENUM('active', 'inactive', 'suspended', 'pending')`);
    
    // Add the status column with default value
    await queryRunner.addColumn(
      'tenants',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive', 'suspended', 'pending'],
        default: "'active'",
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the status column
    await queryRunner.dropColumn('tenants', 'status');
    
    // Drop the enum type
    await queryRunner.query(`DROP TYPE "tenant_status_enum"`);
  }
}
