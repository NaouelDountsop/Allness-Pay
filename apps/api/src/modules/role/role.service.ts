import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AdminRole } from './entities/admin-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-premission.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(AdminRole)
    private readonly adminRoleRepo: Repository<AdminRole>,
  ) {}

  // --- Permissions ---

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('Cette permission existe déjà');
    }
    return this.permissionRepo.save(this.permissionRepo.create(dto));
  }

  findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  // --- Rôles ---

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('Ce rôle existe déjà');
    }

    const permissions = await this.resolvePermissions(dto.permissionIds);
    const role = this.roleRepo.create({ name: dto.name, description: dto.description, permissions });
    return this.roleRepo.save(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);

    if (dto.description !== undefined) {
      role.description = dto.description;
    }
    if (dto.permissionIds !== undefined) {
      role.permissions = await this.resolvePermissions(dto.permissionIds);
    }

    return this.roleRepo.save(role);
  }

  findAllRoles(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['permissions'] });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }
    return role;
  }

  // --- Attribution aux administrateurs ---

  async assignRole(adminId: number, roleId: string, assignedBy: number): Promise<AdminRole> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    const existing = await this.adminRoleRepo.findOne({ where: { adminId, roleId } });
    if (existing) {
      throw new ConflictException('Ce rôle est déjà attribué à cet administrateur');
    }

    const adminRole = this.adminRoleRepo.create({ adminId, roleId, assignedBy });
    return this.adminRoleRepo.save(adminRole);
  }

  async revokeRole(adminId: number, roleId: string): Promise<void> {
    const result = await this.adminRoleRepo.delete({ adminId, roleId });
    if (result.affected === 0) {
      throw new NotFoundException("Cet administrateur n'a pas ce rôle");
    }
  }

  async getAdminRoles(adminId: number): Promise<Role[]> {
    const adminRoles = await this.adminRoleRepo.find({
      where: { adminId },
      relations: ['role', 'role.permissions'],
    });
    return adminRoles.map((ar) => ar.role);
  }

  async getAdminPermissionNames(adminId: number): Promise<string[]> {
    const roles = await this.getAdminRoles(adminId);
    const names = new Set<string>();
    for (const role of roles) {
      for (const permission of role.permissions ?? []) {
        names.add(permission.name);
      }
    }
    return [...names];
  }

  // Utilisé par PermissionsGuard.
  async adminHasAllPermissions(adminId: number, required: string[]): Promise<boolean> {
    if (required.length === 0) return true;
    const owned = await this.getAdminPermissionNames(adminId);
    return required.every((permission) => owned.includes(permission));
  }

  private async resolvePermissions(permissionIds?: string[]): Promise<Permission[]> {
    if (!permissionIds || permissionIds.length === 0) {
      return [];
    }
    const permissions = await this.permissionRepo.findBy({ id: In(permissionIds) });
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Une ou plusieurs permissions sont introuvables');
    }
    return permissions;
  }
}