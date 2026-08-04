import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../role/guards/permissions.guards';
import { RequirePermissions } from '../role/decorators/permissions.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Statistiques du tableau de bord admin' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Liste des utilisateurs' })
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: "Détail d'un utilisateur" })
  findOneUser(@Param('id') id: string) {
    return this.adminService.findOneUser(Number(id));
  }

  @Get('kyc')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Liste des dossiers KYC' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  findAllKyc(@Query('status') status?: string) {
    return this.adminService.findAllKyc(status);
  }

  @Get('kyc/:id')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: "Détail d'un dossier KYC" })
  findOneKyc(@Param('id') id: string) {
    return this.adminService.findOneKyc(Number(id));
  }
}
