import { SetMetadata } from '@nestjs/common';

export const REQUIRE_TENANT_KEY = 'require_tenant';
export const SKIP_TENANT_KEY = 'skip_tenant';

/**
 * Require tenant context for this endpoint
 */
export const RequireTenant = () => SetMetadata(REQUIRE_TENANT_KEY, true);

/**
 * Skip tenant context requirement for this endpoint
 */
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);
