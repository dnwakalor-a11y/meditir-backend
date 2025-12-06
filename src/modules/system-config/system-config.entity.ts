import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConfigCategory {
  SYSTEM = 'system',
  SECURITY = 'security',
  EMAIL = 'email',
  FEATURES = 'features',
  RATE_LIMITING = 'rate_limiting',
  BACKUP = 'backup',
  MAINTENANCE = 'maintenance',
}

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  configId: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  key: string;

  @Column({ type: 'text', nullable: false })
  value: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ConfigCategory, 
    default: ConfigCategory.SYSTEM 
  })
  category: ConfigCategory;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'boolean', default: true })
  isEditable: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  validationRules: string; // JSON string with validation rules

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
