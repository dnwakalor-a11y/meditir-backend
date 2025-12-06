import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSystemConfigsTable1724306500000 implements MigrationInterface {
  name = 'CreateSystemConfigsTable1724306500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type first
    await queryRunner.query(`CREATE TYPE "config_category_enum" AS ENUM('system', 'security', 'email', 'features', 'rate_limiting', 'backup', 'maintenance')`);
    
    // Create the system_configs table
    await queryRunner.createTable(
      new Table({
        name: 'system_configs',
        columns: [
          {
            name: 'configId',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'value',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['system', 'security', 'email', 'features', 'rate_limiting', 'backup', 'maintenance'],
            default: "'system'",
            isNullable: false,
          },
          {
            name: 'isEncrypted',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'isEditable',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'validationRules',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_system_configs_key',
            columnNames: ['key'],
          },
          {
            name: 'IDX_system_configs_category',
            columnNames: ['category'],
          },
          {
            name: 'IDX_system_configs_active',
            columnNames: ['isActive'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the table
    await queryRunner.dropTable('system_configs');
    
    // Drop the enum type
    await queryRunner.query(`DROP TYPE "config_category_enum"`);
  }
}
