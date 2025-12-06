import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../modules/rbac/rbac.service';
import {
  PERMISSIONS_KEY,
  ROLES_KEY,
  TENANT_ADMIN_KEY,
  PLATFORM_ADMIN_KEY,
  RESOURCE_OWNERSHIP_KEY,
} from './rbac.decorators';
import { UserRole } from '../modules/users/user.entity';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check for platform admin requirement
    const requiresPlatformAdmin = this.reflector.getAllAndOverride<boolean>(
      PLATFORM_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiresPlatformAdmin) {
      if (user.role !== UserRole.PLATFORM_ADMIN) {
        throw new ForbiddenException('Platform admin access required');
      }
      return true;
    }

    // Check for tenant admin requirement
    const requiresTenantAdmin = this.reflector.getAllAndOverride<boolean>(
      TENANT_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiresTenantAdmin) {
      if (![UserRole.ADMIN, UserRole.PLATFORM_ADMIN].includes(user.role)) {
        throw new ForbiddenException('Tenant admin access required');
      }
      return true;
    }

    // Check required roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        throw new ForbiddenException('Insufficient role permissions');
      }
    }

    // Check required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<
      string[] | { any: string[] } | { all: string[] }
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (requiredPermissions) {
      const userPermissions = await this.rbacService.getUserPermissions(
        user.userId,
      );

      let hasPermission = false;

      if (Array.isArray(requiredPermissions)) {
        // Default behavior: user must have ALL specified permissions
        hasPermission = requiredPermissions.every((permission) =>
          userPermissions.includes(permission),
        );
      } else if ('any' in requiredPermissions) {
        // User must have ANY of the specified permissions
        hasPermission = requiredPermissions.any.some((permission) =>
          userPermissions.includes(permission),
        );
      } else if ('all' in requiredPermissions) {
        // User must have ALL of the specified permissions
        hasPermission = requiredPermissions.all.every((permission) =>
          userPermissions.includes(permission),
        );
      }

      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Check resource ownership
    const resourceOwnershipParam = this.reflector.getAllAndOverride<string>(
      RESOURCE_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (resourceOwnershipParam) {
      const resourceId = request.params[resourceOwnershipParam];
      if (resourceId) {
        const isOwner = await this.rbacService.checkResourceOwnership(
          user.userId,
          resourceId,
          user.tenantId,
        );

        // Allow platform admins and tenant admins to bypass ownership check
        const canBypassOwnership = [
          UserRole.PLATFORM_ADMIN,
          UserRole.ADMIN,
        ].includes(user.role);

        if (!isOwner && !canBypassOwnership) {
          throw new ForbiddenException(
            'Access denied: insufficient ownership rights',
          );
        }
      }
    }

    return true;
  }
}
