import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, RoleType } from './role.entity';
import { Permission } from './permission.entity';
import { UserRole } from './user-role.entity';
import { User } from '../users/user.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Get all permissions for a user
  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['role', 'role.permissions'],
    });

    const permissions = new Set<string>();
    userRoles.forEach((userRole) => {
      userRole.role.permissions?.forEach((permission) => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  }

  // Get all roles for a user
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['role'],
    });

    return userRoles.map((userRole) => userRole.role);
  }

  // Assign role to user
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date | null,
  ): Promise<UserRole> {
    // Check if role already exists
    const existingRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (existingRole) {
      existingRole.isActive = true;
      existingRole.assignedBy = assignedBy;
      existingRole.expiresAt = expiresAt || null;
      existingRole.assignedAt = new Date();
      return this.userRoleRepository.save(existingRole);
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt,
      isActive: true,
    });

    return this.userRoleRepository.save(userRole);
  }

  // Remove role from user
  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.userRoleRepository.update(
      { userId, roleId },
      { isActive: false },
    );
  }

  // Check if user has permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  // Check if user has role
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some((role) => role.name === roleName);
  }

  // Check resource ownership (to be implemented based on specific resources)
  async checkResourceOwnership(
    userId: string,
    resourceId: string,
    tenantId: string,
  ): Promise<boolean> {
    // This is a basic implementation - should be extended for specific resources
    // For now, we'll check if the user exists and belongs to the same tenant
    const user = await this.userRepository.findOne({
      where: { userId, tenantId },
    });
    
    return !!user;
  }

  // Create a new role
  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  // Add permissions to role
  async addPermissionsToRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.permissionRepository.find({
      where: { permissionId: In(permissionIds) },
    });

    role.permissions = [...(role.permissions || []), ...permissions];
    return this.roleRepository.save(role);
  }

  // Remove permissions from role
  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.permissions = role.permissions?.filter(
      (permission) => !permissionIds.includes(permission.permissionId),
    ) || [];

    return this.roleRepository.save(role);
  }

  // Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { isActive: true },
    });
  }

  // Get all roles for a tenant
  async getTenantRoles(tenantId: string): Promise<Role[]> {
    return this.roleRepository.find({
      where: [
        { tenantId, isActive: true },
        { type: RoleType.SYSTEM, isActive: true }, // Include system roles
      ],
      relations: ['permissions'],
    });
  }

  // Check if user is tenant admin
  async isTenantAdmin(userId: string, tenantId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { userId, tenantId },
    });
    
    return user?.role === 'Admin';
  }

  // Check if user is platform admin
  async isPlatformAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { userId },
    });
    
    return user?.role === 'PlatformAdmin';
  }

  // Find role by name
  async findRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name, isActive: true },
    });
  }
}
