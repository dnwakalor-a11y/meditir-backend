import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { any: permissions });

export const RequireAllPermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { all: permissions });

// Tenant context decorators
export const TENANT_ADMIN_KEY = 'tenantAdmin';
export const PLATFORM_ADMIN_KEY = 'platformAdmin';

export const RequireTenantAdmin = () => SetMetadata(TENANT_ADMIN_KEY, true);
export const RequirePlatformAdmin = () => SetMetadata(PLATFORM_ADMIN_KEY, true);

// Ownership decorators
export const RESOURCE_OWNERSHIP_KEY = 'resourceOwnership';
export const RequireResourceOwnership = (resourceParam: string = 'id') =>
  SetMetadata(RESOURCE_OWNERSHIP_KEY, resourceParam);
