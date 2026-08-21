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
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TontineService } from './tontine.service';
import { ContributionService } from './services/contribution.service';
import { InvitationService } from './services/invitation.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { ContributeFromWalletDto } from './dto/contribute-from-wallet.dto';
import { TontineStatus } from './entities/tontine.entity';

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
    private readonly invitationService: InvitationService,
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

 
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une tontine par ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tontineService.findOne(id);
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
}
