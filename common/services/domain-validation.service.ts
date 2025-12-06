import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../modules/tenants/tenant.entity';

@Injectable()
export class DomainValidationService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Validate subdomain format
   */
  validateSubdomain(subdomain: string): boolean {
    // Check basic format requirements
    if (!subdomain || typeof subdomain !== 'string') {
      return false;
    }

    // Length constraints
    if (subdomain.length < 3 || subdomain.length > 63) {
      return false;
    }

    // Format validation: lowercase letters, numbers, and hyphens only
    // Cannot start or end with hyphen
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return false;
    }

    // Check against reserved subdomains
    if (this.isReservedSubdomain(subdomain)) {
      return false;
    }

    return true;
  }

  /**
   * Check if subdomain is available (not taken by another tenant)
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain: subdomain.toLowerCase() },
    });

    return !existingTenant;
  }

  /**
   * Sanitize subdomain input
   */
  sanitizeSubdomain(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-{2,}/g, '-'); // Replace multiple consecutive hyphens with single
  }

  /**
   * Generate available subdomain suggestion
   */
  async generateAvailableSubdomain(baseName: string): Promise<string> {
    const sanitized = this.sanitizeSubdomain(baseName);

    if (!sanitized) {
      throw new BadRequestException(
        'Cannot generate subdomain from provided name',
      );
    }

    let candidate = sanitized;
    let counter = 1;

    // Keep trying until we find an available subdomain
    while (!(await this.isSubdomainAvailable(candidate))) {
      candidate = `${sanitized}-${counter}`;
      counter++;

      // Prevent infinite loop
      if (counter > 1000) {
        throw new BadRequestException('Unable to generate available subdomain');
      }
    }

    return candidate;
  }

  /**
   * Validate subdomain for tenant creation
   */
  async validateForCreation(subdomain: string): Promise<void> {
    const sanitized = subdomain.toLowerCase().trim();

    if (!this.validateSubdomain(sanitized)) {
      throw new BadRequestException(
        'Invalid subdomain format. Must be 3-63 characters, contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.',
      );
    }

    if (!(await this.isSubdomainAvailable(sanitized))) {
      throw new BadRequestException('Subdomain is already taken');
    }
  }

  /**
   * Get list of reserved subdomains
   */
  private isReservedSubdomain(subdomain: string): boolean {
    const reserved = [
      // System subdomains
      'www',
      'api',
      'admin',
      'administrator',
      'app',
      'application',
      'platform',

      // Common services
      'mail',
      'email',
      'smtp',
      'imap',
      'pop',
      'ftp',
      'sftp',

      // Content/Media
      'blog',
      'news',
      'shop',
      'store',
      'cdn',
      'assets',
      'static',
      'media',
      'images',
      'files',

      // Support/Help
      'support',
      'help',
      'docs',
      'documentation',
      'wiki',
      'kb',
      'knowledgebase',

      // Monitoring/Status
      'status',
      'health',
      'monitor',
      'monitoring',
      'metrics',
      'analytics',

      // Development/Testing
      'dev',
      'development',
      'test',
      'testing',
      'staging',
      'demo',
      'sandbox',

      // Security
      'secure',
      'ssl',
      'vpn',
      'auth',
      'login',
      'oauth',

      // Medical specific
      'patient',
      'patients',
      'doctor',
      'doctors',
      'medical',
      'healthcare',
      'health',
      'clinic',
      'hospital',
      'meditir',

      // Generic business
      'portal',
      'dashboard',
      'billing',
      'invoice',
      'payment',
      'payments',
      'account',
      'accounts',
      'profile',
      'settings',
      'config',
      'configuration',

      // Technical
      'database',
      'db',
      'cache',
      'redis',
      'queue',
      'worker',
      'cron',
      'backup',
      'archive',
    ];

    return reserved.includes(subdomain.toLowerCase());
  }

  /**
   * Get reserved subdomains list (for API responses)
   */
  getReservedSubdomains(): string[] {
    return [
      'www',
      'api',
      'admin',
      'app',
      'mail',
      'ftp',
      'blog',
      'shop',
      'support',
      'help',
      'docs',
      'status',
      'cdn',
      'assets',
      'static',
      'media',
      'dev',
      'test',
      'staging',
      'demo',
      'secure',
      'auth',
      'patient',
      'doctor',
      'medical',
      'portal',
      'dashboard',
      'billing',
    ];
  }
}
