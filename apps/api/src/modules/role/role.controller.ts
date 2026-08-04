import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-premission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RequirePermissions } from './decorators/permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guards';
// Hypothèse : même guard JWT que les autres modules.
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('roles:manage')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Get()
  findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Patch(':id')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Post('permissions')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rolesService.createPermission(dto);
  }

  @Get('permissions')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post('administrateurs/:adminId/assign')
  assignRole(
    @Req() req: AuthenticatedRequest,
    @Param('adminId', ParseIntPipe) adminId: number,
    @Body() dto: AssignRoleDto,
  ) {
    return this.rolesService.assignRole(adminId, dto.roleId, req.user.id);
  }

  @Delete('administrateurs/:adminId/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeRole(
    @Param('adminId', ParseIntPipe) adminId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.rolesService.revokeRole(adminId, roleId);
  }

  @Get('administrateurs/:adminId')
  getAdminRoles(@Param('adminId', ParseIntPipe) adminId: number) {
    return this.rolesService.getAdminRoles(adminId);
  }
}