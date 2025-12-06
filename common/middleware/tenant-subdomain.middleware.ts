import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { Tenant } from '../../modules/tenants/tenant.entity';

export interface TenantRequest extends Request {
  tenant?: Tenant;
  tenantId?: string;
  subdomain?: string;
}

@Injectable()
export class TenantSubdomainMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      // Extract host from request
      const host = req.get('host') || req.get('X-Forwarded-Host') || '';

      // Skip tenant resolution for API routes, admin routes, and non-subdomain requests
      if (this.shouldSkipTenantResolution(req.path, host)) {
        return next();
      }

      // Extract subdomain from host
      const subdomain = this.extractSubdomain(host);

      if (subdomain) {
        // Find tenant by subdomain
        const tenant = await this.tenantsService.findBySubdomain(subdomain);

        if (!tenant) {
          return res.status(404).json({
            statusCode: 404,
            message: `Tenant not found for subdomain: ${subdomain}`,
            error: 'Tenant Not Found',
          });
        }

        if (tenant.status !== 'active') {
          return res.status(503).json({
            statusCode: 503,
            message: `This service is temporarily unavailable`,
            error: 'Service Unavailable',
          });
        }

        // Inject tenant context into request
        req.tenant = tenant;
        req.tenantId = tenant.tenantId;
        req.subdomain = subdomain;

        // Add tenant info to response headers for debugging
        res.setHeader('X-Tenant-ID', tenant.tenantId);
        res.setHeader('X-Tenant-Subdomain', subdomain);
      }

      next();
    } catch (error) {
      console.error('Tenant resolution error:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal server error during tenant resolution',
        error: 'Internal Server Error',
      });
    }
  }

  private extractSubdomain(host: string): string | null {
    if (!host) return null;

    // Remove port if present
    const hostname = host.split(':')[0];

    // Check if it's a subdomain of meditir.com
    const parts = hostname.split('.');

    // For localhost development
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      return null;
    }

    // For production: extract subdomain from *.meditir.com
    if (parts.length >= 3 && parts.slice(-2).join('.') === 'meditir.com') {
      const subdomain = parts[0];

      // Skip reserved subdomains
      if (this.isReservedSubdomain(subdomain)) {
        return null;
      }

      return subdomain;
    }

    return null;
  }

  private isReservedSubdomain(subdomain: string): boolean {
    const reserved = [
      'www',
      'api',
      'admin',
      'app',
      'mail',
      'email',
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
      'images',
    ];

    return reserved.includes(subdomain.toLowerCase());
  }

  private shouldSkipTenantResolution(path: string, host: string): boolean {
    // Skip for API routes
    if (path.startsWith('/api/')) {
      return true;
    }

    // Skip for health checks
    if (path === '/health' || path === '/') {
      return true;
    }

    // Skip for localhost development
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return true;
    }

    // Skip for main domain (non-subdomain requests)
    const hostname = host.split(':')[0];
    if (hostname === 'meditir.com') {
      return true;
    }

    return false;
  }
}
