import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RbacSeedService } from './rbac-seed.service';
import { RbacController } from './rbac.controller';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { UserRole } from './user-role.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, UserRole, User])],
  providers: [RbacService, RbacSeedService],
  controllers: [RbacController],
  exports: [RbacService, RbacSeedService],
})
export class RbacModule {}
