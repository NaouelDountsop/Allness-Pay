import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AdminRole } from './entities/admin-role.entity';
import { Administrateur } from './entities/administrateur.entity';
import { RolesService } from './role.service';
import { RolesController } from './role.controller';
import { AdministrateursService } from './administrateurs.service';
import { AdministrateursController } from './administrateurs.controller';
import { PermissionsGuard } from './guards/permissions.guards';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, AdminRole, Administrateur])],
  controllers: [RolesController, AdministrateursController],
  providers: [RolesService, AdministrateursService, PermissionsGuard],
  exports: [RolesService, AdministrateursService, PermissionsGuard],
})
export class RolesModule {}
