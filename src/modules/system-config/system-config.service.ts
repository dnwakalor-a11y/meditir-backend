import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig, ConfigCategory } from './system-config.entity';
import * as crypto from 'crypto';

interface ConfigValue {
  [key: string]: any;
}

@Injectable()
export class SystemConfigService {
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {
    // Use environment variable or generate a key for encryption
    this.encryptionKey =
      process.env.CONFIG_ENCRYPTION_KEY || 'medzen-default-key-32-chars-long!';
  }

  // ===================== CORE CONFIG METHODS =====================

  async getConfig(key: string): Promise<any> {
    const config = await this.configRepository.findOne({
      where: { key, isActive: true },
    });

    if (!config) {
      throw new NotFoundException(`Configuration key '${key}' not found`);
    }

    return this.parseConfigValue(config);
  }

  async getConfigsByCategory(category: ConfigCategory): Promise<ConfigValue> {
    const configs = await this.configRepository.find({
      where: { category, isActive: true },
    });

    const result: ConfigValue = {};
    for (const config of configs) {
      result[config.key] = this.parseConfigValue(config);
    }

    return result;
  }

  async getAllConfigs(): Promise<ConfigValue> {
    const configs = await this.configRepository.find({
      where: { isActive: true },
    });

    const result: ConfigValue = {};
    for (const config of configs) {
      result[config.key] = this.parseConfigValue(config);
    }

    return result;
  }

  async setConfig(
    key: string,
    value: any,
    description?: string,
    category: ConfigCategory = ConfigCategory.SYSTEM,
    isEncrypted: boolean = false,
  ): Promise<SystemConfig> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    const finalValue = isEncrypted ? this.encrypt(stringValue) : stringValue;

    let config = await this.configRepository.findOne({ where: { key } });

    if (config) {
      config.value = finalValue;
      config.description = description || config.description;
      config.category = category;
      config.isEncrypted = isEncrypted;
    } else {
      config = this.configRepository.create({
        key,
        value: finalValue,
        description,
        category,
        isEncrypted,
        isEditable: true,
        isActive: true,
      });
    }

    return this.configRepository.save(config);
  }

  async updateConfig(key: string, value: any): Promise<SystemConfig> {
    const config = await this.configRepository.findOne({
      where: { key, isActive: true },
    });

    if (!config) {
      throw new NotFoundException(`Configuration key '${key}' not found`);
    }

    if (!config.isEditable) {
      throw new BadRequestException(
        `Configuration key '${key}' is not editable`,
      );
    }

    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    config.value = config.isEncrypted ? this.encrypt(stringValue) : stringValue;

    return this.configRepository.save(config);
  }

  async deleteConfig(key: string): Promise<void> {
    const config = await this.configRepository.findOne({ where: { key } });

    if (!config) {
      throw new NotFoundException(`Configuration key '${key}' not found`);
    }

    if (!config.isEditable) {
      throw new BadRequestException(
        `Configuration key '${key}' cannot be deleted`,
      );
    }

    await this.configRepository.remove(config);
  }

  // ===================== SPECIFIC CONFIG GETTERS =====================

  async getMaintenanceMode(): Promise<boolean> {
    try {
      return await this.getConfig('maintenance.enabled');
    } catch {
      return false;
    }
  }

  async setMaintenanceMode(
    enabled: boolean,
    message?: string,
    estimatedDuration?: number,
  ): Promise<void> {
    await this.setConfig(
      'maintenance.enabled',
      enabled,
      'Maintenance mode status',
      ConfigCategory.MAINTENANCE,
    );

    if (message) {
      await this.setConfig(
        'maintenance.message',
        message,
        'Maintenance mode message',
        ConfigCategory.MAINTENANCE,
      );
    }

    if (estimatedDuration) {
      await this.setConfig(
        'maintenance.estimatedDuration',
        estimatedDuration,
        'Estimated maintenance duration in minutes',
        ConfigCategory.MAINTENANCE,
      );
    }
  }

  async getPasswordPolicy(): Promise<any> {
    try {
      return await this.getConfig('security.passwordPolicy');
    } catch {
      return {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expirationDays: 90,
      };
    }
  }

  async getEmailConfig(): Promise<any> {
    try {
      return await this.getConfig('email.smtp');
    } catch {
      return {
        smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpSecure: process.env.SMTP_SECURE === 'true',
        fromEmail:
          process.env.FROM_EMAIL || 'noreply@notifications.meditir.com',
        fromName: process.env.FROM_NAME || 'MedZen Platform',
      };
    }
  }

  async getFeatureFlags(): Promise<any> {
    try {
      return await this.getConfig('features.flags');
    } catch {
      return {
        videoCallsEnabled: true,
        messagingEnabled: true,
        billingEnabled: false,
        analyticsEnabled: true,
      };
    }
  }

  async getRateLimitingConfig(): Promise<any> {
    try {
      return await this.getConfig('security.rateLimiting');
    } catch {
      return {
        enabled: true,
        requestsPerMinute: 100,
        burstLimit: 150,
      };
    }
  }

  async getBackupConfig(): Promise<any> {
    try {
      return await this.getConfig('backup.config');
    } catch {
      return {
        enabled: true,
        frequency: 'daily',
        retention: 30,
      };
    }
  }

  async getSystemSettings(): Promise<any> {
    try {
      return await this.getConfig('system.settings');
    } catch {
      return {
        maxFileUploadSize: 10,
        sessionTimeout: 30,
      };
    }
  }

  // ===================== BULK OPERATIONS =====================

  async getFullSystemConfig(): Promise<any> {
    return {
      configId: 'system-config-1',
      maintenanceMode: await this.getMaintenanceMode(),
      ...(await this.getSystemSettings()),
      passwordPolicy: await this.getPasswordPolicy(),
      emailConfig: await this.getEmailConfig(),
      featureFlags: await this.getFeatureFlags(),
      rateLimiting: await this.getRateLimitingConfig(),
      backupConfig: await this.getBackupConfig(),
    };
  }

  async updateSystemConfig(updates: any): Promise<any> {
    const updatePromises: Promise<SystemConfig>[] = [];

    if (updates.maintenanceMode !== undefined) {
      updatePromises.push(
        this.setConfig('maintenance.enabled', updates.maintenanceMode),
      );
    }

    if (
      updates.maxFileUploadSize !== undefined ||
      updates.sessionTimeout !== undefined
    ) {
      const currentSettings = await this.getSystemSettings();
      const newSettings = {
        ...currentSettings,
        ...(updates.maxFileUploadSize && {
          maxFileUploadSize: updates.maxFileUploadSize,
        }),
        ...(updates.sessionTimeout && {
          sessionTimeout: updates.sessionTimeout,
        }),
      };
      updatePromises.push(this.setConfig('system.settings', newSettings));
    }

    if (updates.passwordPolicy) {
      const currentPolicy = await this.getPasswordPolicy();
      const newPolicy = { ...currentPolicy, ...updates.passwordPolicy };
      updatePromises.push(this.setConfig('security.passwordPolicy', newPolicy));
    }

    if (updates.emailConfig) {
      const currentEmailConfig = await this.getEmailConfig();
      const newEmailConfig = { ...currentEmailConfig, ...updates.emailConfig };
      updatePromises.push(
        this.setConfig(
          'email.smtp',
          newEmailConfig,
          'SMTP configuration',
          ConfigCategory.EMAIL,
          true,
        ),
      );
    }

    if (updates.featureFlags) {
      const currentFlags = await this.getFeatureFlags();
      const newFlags = { ...currentFlags, ...updates.featureFlags };
      updatePromises.push(this.setConfig('features.flags', newFlags));
    }

    if (updates.rateLimiting) {
      const currentRateLimit = await this.getRateLimitingConfig();
      const newRateLimit = { ...currentRateLimit, ...updates.rateLimiting };
      updatePromises.push(
        this.setConfig('security.rateLimiting', newRateLimit),
      );
    }

    if (updates.backupConfig) {
      const currentBackup = await this.getBackupConfig();
      const newBackup = { ...currentBackup, ...updates.backupConfig };
      updatePromises.push(this.setConfig('backup.config', newBackup));
    }

    await Promise.all(updatePromises);

    return this.getFullSystemConfig();
  }

  // ===================== SEEDING DEFAULT CONFIGS =====================

  async seedDefaultConfigs(): Promise<void> {
    const defaultConfigs = [
      {
        key: 'maintenance.enabled',
        value: 'false',
        description: 'Global maintenance mode status',
        category: ConfigCategory.MAINTENANCE,
      },
      {
        key: 'system.settings',
        value: JSON.stringify({
          maxFileUploadSize: 10,
          sessionTimeout: 30,
        }),
        description: 'General system settings',
        category: ConfigCategory.SYSTEM,
      },
      {
        key: 'security.passwordPolicy',
        value: JSON.stringify({
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expirationDays: 90,
        }),
        description: 'Password policy configuration',
        category: ConfigCategory.SECURITY,
      },
      {
        key: 'email.smtp',
        value: JSON.stringify({
          smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
          smtpPort: parseInt(process.env.SMTP_PORT || '587'),
          smtpSecure: process.env.SMTP_SECURE === 'true',
          fromEmail:
            process.env.FROM_EMAIL || 'noreply@notifications.meditir.com',
          fromName: process.env.FROM_NAME || 'MedZen Platform',
        }),
        description: 'SMTP email configuration',
        category: ConfigCategory.EMAIL,
        isEncrypted: true,
      },
      {
        key: 'features.flags',
        value: JSON.stringify({
          videoCallsEnabled: true,
          messagingEnabled: true,
          billingEnabled: false,
          analyticsEnabled: true,
        }),
        description: 'Feature flags configuration',
        category: ConfigCategory.FEATURES,
      },
      {
        key: 'security.rateLimiting',
        value: JSON.stringify({
          enabled: true,
          requestsPerMinute: 100,
          burstLimit: 150,
        }),
        description: 'Rate limiting configuration',
        category: ConfigCategory.SECURITY,
      },
      {
        key: 'backup.config',
        value: JSON.stringify({
          enabled: true,
          frequency: 'daily',
          retention: 30,
        }),
        description: 'Backup configuration',
        category: ConfigCategory.BACKUP,
      },
    ];

    for (const config of defaultConfigs) {
      const existing = await this.configRepository.findOne({
        where: { key: config.key },
      });

      if (!existing) {
        const newConfig = this.configRepository.create({
          ...config,
          isEditable: true,
          isActive: true,
        });
        await this.configRepository.save(newConfig);
      }
    }
  }

  // ===================== UTILITY METHODS =====================

  private parseConfigValue(config: SystemConfig): any {
    let value = config.value;

    if (config.isEncrypted) {
      value = this.decrypt(value);
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(text: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(text, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      // If decryption fails, return the original text
      // This handles cases where data might not be encrypted
      return text;
    }
  }
}
