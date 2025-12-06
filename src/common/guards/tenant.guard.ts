import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantRequest } from '../middleware/tenant-subdomain.middleware';
import {
  REQUIRE_TENANT_KEY,
  SKIP_TENANT_KEY,
} from '../decorators/tenant-required.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<TenantRequest>();

    // Check if tenant context is explicitly skipped
    const skipTenant = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTenant) {
      return true;
    }

    // Check if tenant context is required
    const requireTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requireTenant) {
      if (!request.tenant || !request.tenantId) {
        throw new ForbiddenException(
          'Tenant context required for this operation',
        );
      }

      // Additional checks can be added here
      if (request.tenant.status !== 'active') {
        throw new ForbiddenException('Tenant is not active');
      }
    }

    return true;
  }
}
