import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
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

  @Get()
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Activités récentes' })
  getRecentActivities() {
    return this.adminService.getRecentActivities();
  }

  @Get('dashboard/stats')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Statistiques du tableau de bord admin' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/chart')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Données graphique hebdomadaire' })
  getChartWeekly() {
    return this.adminService.getChartWeekly();
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

  @Get('kyc/pending')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'KYC en attente (top 4)' })
  findKycPending() {
    return this.adminService.getKycPending();
  }

  @Get('kyc/:id')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: "Détail d'un dossier KYC" })
  findOneKyc(@Param('id') id: string) {
    return this.adminService.findOneKyc(Number(id));
  }

  @Get('tontines')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Liste des tontines (admin)' })
  findAllTontines() {
    return this.adminService.findAllTontines();
  }

  @Get('transactions')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Liste des transactions (admin)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out'],
  })
  @ApiQuery({ name: 'provider', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAllTransactions(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('provider') provider?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.findAllTransactions({
      status,
      type,
      provider,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('transactions/export')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Exporter les transactions en Excel' })
  async exportTransactions(@Res() res: Response) {
    const buffer = await this.adminService.exportTransactionsXlsx();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.xlsx"');
    res.send(buffer);
  }

  @Get('users/export')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Exporter les utilisateurs en Excel' })
  async exportUsers(@Res() res: Response) {
    const buffer = await this.adminService.exportUsersXlsx();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="utilisateurs.xlsx"');
    res.send(buffer);
  }

  @Get('tontines/export')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Exporter les tontines en Excel' })
  async exportTontines(@Res() res: Response) {
    const buffer = await this.adminService.exportTontinesXlsx();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="tontines.xlsx"');
    res.send(buffer);
  }
}
