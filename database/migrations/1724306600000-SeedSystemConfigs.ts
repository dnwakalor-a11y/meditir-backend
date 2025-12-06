import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigCategory } from '../../modules/system-config/system-config.entity';

export class SeedSystemConfigs1724306600000 implements MigrationInterface {
  name = 'SeedSystemConfigs1724306600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert default system configurations
    await queryRunner.query(`
      INSERT INTO system_configs (key, value, description, category, "isEncrypted", "isEditable", "isActive") VALUES
      
      -- System configurations
      ('maintenance_mode', 'false', 'Enable or disable maintenance mode for the platform', 'system', false, true, true),
      ('platform_name', 'MedZen', 'Name of the telehealth platform', 'system', false, true, true),
      ('platform_version', '1.0.0', 'Current version of the platform', 'system', false, false, true),
      ('max_tenants', '1000', 'Maximum number of tenants allowed on the platform', 'system', false, true, true),
      ('default_timezone', 'UTC', 'Default timezone for the platform', 'system', false, true, true),
      
      -- Security configurations
      ('password_min_length', '8', 'Minimum password length requirement', 'security', false, true, true),
      ('password_require_uppercase', 'true', 'Require uppercase letters in passwords', 'security', false, true, true),
      ('password_require_lowercase', 'true', 'Require lowercase letters in passwords', 'security', false, true, true),
      ('password_require_numbers', 'true', 'Require numbers in passwords', 'security', false, true, true),
      ('password_require_special', 'true', 'Require special characters in passwords', 'security', false, true, true),
      ('jwt_expires_in', '24h', 'JWT token expiration time', 'security', false, true, true),
      ('session_timeout', '30m', 'Session timeout duration', 'security', false, true, true),
      ('max_login_attempts', '5', 'Maximum login attempts before account lockout', 'security', false, true, true),
      ('account_lockout_duration', '15m', 'Duration for account lockout after max attempts', 'security', false, true, true),
      
      -- Email configurations
      ('smtp_host', '', 'SMTP server host for email sending', 'email', true, true, true),
      ('smtp_port', '587', 'SMTP server port', 'email', false, true, true),
      ('smtp_username', '', 'SMTP username for authentication', 'email', true, true, true),
      ('smtp_password', '', 'SMTP password for authentication', 'email', true, true, true),
      ('email_from_address', 'noreply@notifications.meditir.com', 'Default from email address', 'email', false, true, true),
      ('email_from_name', 'MedZen Platform', 'Default from name for emails', 'email', false, true, true),
      
      -- Feature flags
      ('enable_two_factor_auth', 'true', 'Enable two-factor authentication', 'features', false, true, true),
      ('enable_video_calls', 'true', 'Enable video call functionality', 'features', false, true, true),
      ('enable_file_sharing', 'true', 'Enable file sharing between users', 'features', false, true, true),
      ('enable_notifications', 'true', 'Enable push notifications', 'features', false, true, true),
      ('enable_audit_logging', 'true', 'Enable comprehensive audit logging', 'features', false, true, true),
      ('max_file_size_mb', '10', 'Maximum file upload size in MB', 'features', false, true, true),
      ('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png,gif', 'Allowed file types for upload', 'features', false, true, true),
      
      -- Rate limiting
      ('api_rate_limit_requests', '100', 'Number of requests allowed per time window', 'rate_limiting', false, true, true),
      ('api_rate_limit_window', '15m', 'Time window for rate limiting', 'rate_limiting', false, true, true),
      ('login_rate_limit_requests', '5', 'Number of login attempts allowed per time window', 'rate_limiting', false, true, true),
      ('login_rate_limit_window', '15m', 'Time window for login rate limiting', 'rate_limiting', false, true, true),
      
      -- Backup configurations
      ('backup_enabled', 'true', 'Enable automatic database backups', 'backup', false, true, true),
      ('backup_frequency', 'daily', 'Frequency of automatic backups', 'backup', false, true, true),
      ('backup_retention_days', '30', 'Number of days to retain backups', 'backup', false, true, true),
      ('backup_storage_path', '/backups', 'Path for storing backup files', 'backup', false, true, true),
      
      -- Maintenance configurations
      ('maintenance_window_start', '02:00', 'Start time for maintenance window (24h format)', 'maintenance', false, true, true),
      ('maintenance_window_end', '04:00', 'End time for maintenance window (24h format)', 'maintenance', false, true, true),
      ('maintenance_notification_hours', '24', 'Hours before maintenance to notify users', 'maintenance', false, true, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all seeded configurations
    await queryRunner.query(`DELETE FROM system_configs WHERE key IN (
      'maintenance_mode', 'platform_name', 'platform_version', 'max_tenants', 'default_timezone',
      'password_min_length', 'password_require_uppercase', 'password_require_lowercase', 
      'password_require_numbers', 'password_require_special', 'jwt_expires_in', 
      'session_timeout', 'max_login_attempts', 'account_lockout_duration',
      'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'email_from_address', 'email_from_name',
      'enable_two_factor_auth', 'enable_video_calls', 'enable_file_sharing', 'enable_notifications',
      'enable_audit_logging', 'max_file_size_mb', 'allowed_file_types',
      'api_rate_limit_requests', 'api_rate_limit_window', 'login_rate_limit_requests', 'login_rate_limit_window',
      'backup_enabled', 'backup_frequency', 'backup_retention_days', 'backup_storage_path',
      'maintenance_window_start', 'maintenance_window_end', 'maintenance_notification_hours'
    )`);
  }
}
