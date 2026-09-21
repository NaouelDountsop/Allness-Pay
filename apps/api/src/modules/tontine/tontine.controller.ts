import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TontineService } from './tontine.service';
import { ContributionService } from './services/contribution.service';
import { CycleService } from './services/cycle.service';
import { PayoutService } from './services/payout.service';
import { InvitationService } from './services/invitation.service';
import { MessageService } from '../messaging/message.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ContributeFromWalletDto } from './dto/contribute-from-wallet.dto';
import { CreateMessageDto } from '../messaging/dto/create-message.dto';
import { TontineStatus } from './entities/tontine.entity';
import { tontineMulterConfig } from '../../common/config/tontine-multer.config';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string };
}

@ApiTags('Tontines')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tontines')
export class TontineController {
  constructor(
    private readonly tontineService: TontineService,
    private readonly contributionService: ContributionService,
    private readonly cycleService: CycleService,
    private readonly payoutService: PayoutService,
    private readonly invitationService: InvitationService,
    private readonly messageService: MessageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tontine' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTontineDto) {
    return this.tontineService.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: "Lister les tontines de l'utilisateur" })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.tontineService.findAll(req.user.sub);
  }

  @Get('my-contributions')
  @ApiOperation({ summary: "Historique des contributions de l'utilisateur (toutes tontines)" })
  async getMyContributions(@Req() req: AuthenticatedRequest) {
    const tontines = await this.tontineService.findAll(req.user.sub);
    const allContributions = await Promise.all(
      tontines.map((t) => this.contributionService.findAllByTontine(t.id, req.user.sub)),
    );
    return allContributions.flat();
  }

  @Get('invitations')
  @ApiOperation({ summary: "Lister toutes les invitations de l'utilisateur (tous statuts)" })
  listAllMyInvitations(@Req() req: AuthenticatedRequest) {
    return this.invitationService.findAllByUserId(req.user.sub);
  }

  @Get('invitations/pending')
  @ApiOperation({ summary: "Lister les invitations en attente de l'utilisateur" })
  listPendingInvitations(@Req() req: AuthenticatedRequest) {
    return this.invitationService.findPendingByUserId(req.user.sub);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Lister les messages d une tontine' })
  @ApiParam({ name: 'id', type: String })
  listMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.messageService.findAll(id, req.user.sub);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Envoyer un message (texte et/ou fichier)' })
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(FileInterceptor('file', tontineMulterConfig))
  createMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.messageService.create(id, req.user.sub, dto, file);
  }

  @Get(':id/messages/unread')
  @ApiOperation({ summary: 'Nombre de messages non lus' })
  @ApiParam({ name: 'id', type: String })
  getUnreadCounts(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.messageService.getUnreadCounts(id, req.user.sub);
  }

  @Post(':id/messages/:messageId/read')
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'messageId', type: String })
  markMessageAsRead(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.messageService.markAsRead(messageId, req.user.sub);
  }

  @Get(':id/contribution-status')
  @ApiOperation({ summary: "Vérifier si l'utilisateur a cotisé pour le cycle actuel" })
  @ApiParam({ name: 'id', type: String })
  async checkMyContributionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contributionService.checkMyContributionStatus(id, req.user.sub);
  }

  @Get(':id/cycles')
  @ApiOperation({ summary: "Lister les cycles d'une tontine" })
  @ApiParam({ name: 'id', type: String })
  listCycles(@Param('id', ParseUUIDPipe) id: string) {
    return this.cycleService.findAllByTontine(id);
  }

  @Get(':id/contributions')
  @ApiOperation({ summary: "Lister les contributions d'une tontine (filtrable par cycle et par utilisateur)" })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'cycleId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  async listContributions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cycleId') cycleId?: string,
    @Query('userId') userId?: string,
  ) {
    if (userId) {
      return this.contributionService.findAllByTontine(id, Number(userId));
    }

    if (cycleId) {
      return this.contributionService.findAllByCycle(cycleId);
    }

    const cycles = await this.cycleService.findAllByTontine(id);
    const allContributions = await Promise.all(
      cycles.map((cycle) => this.contributionService.findAllByCycle(cycle.id)),
    );
    return allContributions.flat();
  }

  @Get(':id/contributions/export')
  @ApiOperation({ summary: 'Exporter les contributions en Excel' })
  @ApiParam({ name: 'id', type: String })
  async exportContributions(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.contributionService.exportByTontine(id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="versements.xlsx"');
    res.send(buffer);
  }

 
  @Get(':id/qr-code-data')
  @ApiOperation({ summary: 'Générer les données QR pour la cotisation en présentiel' })
  @ApiParam({ name: 'id', type: String })
  getQrCodeData(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tontineService.getQrCodeData(id, req.user.sub);
  }

  @Get(':id/qr-contribute-data')
  @ApiOperation({ summary: 'Résoudre les infos de cotisation après scan QR (pré-remplissage)' })
  @ApiParam({ name: 'id', type: String })
  async resolveQrContribute(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const tontine = await this.tontineService.findOne(id, req.user.sub);
    const activeCycle = await this.contributionService.findActiveCycle(id);
    if (!activeCycle) {
      throw new BadRequestException('Aucun cycle actif pour cette tontine');
    }

    const activeMembers = tontine.members.filter(
      (m) => m.status === 'ACTIVE',
    ).length;

    return {
      tontineId: tontine.id,
      tontineName: tontine.name,
      cycleNumber: activeCycle.cycleNumber,
      expectedAmount: Math.ceil(Number(activeCycle.totalPot) / activeMembers).toString(),
      currency: tontine.currency,
    };
  }

  @Get(':id')
@ApiOperation({ summary: 'Obtenir une tontine par ID' })
@ApiParam({ name: 'id', type: String })
findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
  return this.tontineService.findOne(id, req.user.sub);
}

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une tontine (DRAFT uniquement)' })
  @ApiParam({ name: 'id', type: String })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateTontineDto,
  ) {
    return this.tontineService.update(id, dto, req.user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Changer le statut d'une tontine" })
  @ApiParam({ name: 'id', type: String })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body('status') status: TontineStatus,
  ) {
    return this.tontineService.updateStatus(id, req.user.sub, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une tontine (DRAFT uniquement)' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.tontineService.remove(id, req.user.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Ajouter un membre à la tontine' })
  @ApiParam({ name: 'id', type: String })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddMemberDto,
  ) {
    return this.tontineService.addMember(id, req.user.sub, dto.userId);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer un membre de la tontine' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'memberId', type: String })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tontineService.removeMember(id, req.user.sub, memberId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre une tontine' })
  @ApiParam({ name: 'id', type: String })
  join(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.tontineService.join(id, req.user.sub);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quitter une tontine (membres non-admin)' })
  @ApiParam({ name: 'id', type: String })
  leave(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.tontineService.leave(id, req.user.sub);
  }

  @Post(':id/contribute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Contribuer à la tontine depuis son portefeuille' })
  @ApiParam({ name: 'id', type: String })
  async contribute(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ContributeFromWalletDto,
  ) {
    const member = await this.tontineService.findMember(id, req.user.sub);

    const tontine = await this.tontineService.findOne(id, req.user.sub);
    const activeCycle = tontine.members
      ? await this.contributionService.findActiveCycle(id)
      : null;

    if (!activeCycle) {
      throw new BadRequestException('Aucun cycle actif pour cette tontine');
    }

    return this.contributionService.contribute(member.id, {
      cycleId: activeCycle.id,
      amount: dto.amount,
      walletId: dto.walletId,
      pin: dto.pin,
    });
  }

  @Post(':id/invitations')
  @ApiOperation({ summary: 'Envoyer une invitation à rejoindre la tontine' })
  @ApiParam({ name: 'id', type: String })
  createInvitation(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationService.create(id, req.user.sub, dto);
  }

  @Patch(':id/members/reorder')
  @ApiOperation({ summary: "Réordonner l'ordre de passage des membres" })
  @ApiParam({ name: 'id', type: String })
  reorderMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body('memberIds') memberIds: string[],
  ) {
    return this.tontineService.reorderMembers(id, req.user.sub, memberIds);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: "Lister les invitations d'une tontine" })
  @ApiParam({ name: 'id', type: String })
  listInvitations(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitationService.findByTontine(id);
  }

  @Post(':id/cycles/:cycleId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminer manuellement un cycle (admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'cycleId', type: String })
  async completeCycle(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cycleId', ParseUUIDPipe) cycleId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.tontineService.assertAdmin(id, req.user.sub);
    return this.cycleService.completeCycle(cycleId);
  }

  @Post(':id/cycles/:cycleId/release-payout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verser le pot au bénéficiaire (admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'cycleId', type: String })
  async releasePayout(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cycleId', ParseUUIDPipe) cycleId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.tontineService.assertAdmin(id, req.user.sub);
    return this.payoutService.processPayout(cycleId);
  }
}
