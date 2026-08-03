import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TontineService } from './services/tontine.service';
import { CycleService } from './services/cycle.service';
import { ContributionService } from './services/contribution.service';
import { InvitationService } from './services/invitation.service';
import { PayoutService } from './services/payout.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ContributeDto } from './dto/contribute.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { TontineStatus } from './enums/tontine-status.enum';

@ApiTags('Tontines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tontines')
export class TontineController {
  constructor(
    private readonly tontineService: TontineService,
    private readonly cycleService: CycleService,
    private readonly contributionService: ContributionService,
    private readonly invitationService: InvitationService,
    private readonly payoutService: PayoutService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tontine' })
  @ApiResponse({ status: 201, description: 'Tontine créée avec succès' })
  create(@Req() req: { user: { id: number } }, @Body() dto: CreateTontineDto) {
    return this.tontineService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les tontines de l\'utilisateur' })
  findAll(@Req() req: { user: { id: number } }) {
    return this.tontineService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une tontine par ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.tontineService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une tontine (DRAFT uniquement)' })
  @ApiParam({ name: 'id', type: String })
  update(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
    @Body() dto: UpdateTontineDto,
  ) {
    return this.tontineService.update(id, req.user.id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Changer le statut d\'une tontine' })
  @ApiParam({ name: 'id', type: String })
  updateStatus(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
    @Body('status') status: TontineStatus,
  ) {
    return this.tontineService.updateStatus(id, req.user.id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une tontine (DRAFT uniquement)' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.tontineService.remove(id, req.user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Ajouter un membre à la tontine' })
  @ApiParam({ name: 'id', type: String })
  addMember(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
    @Body() dto: AddMemberDto,
  ) {
    return this.tontineService.addMember(id, req.user.id, dto.userId);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer un membre de la tontine' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'memberId', type: String })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.tontineService.removeMember(id, req.user.id, memberId);
  }

  @Post(':id/cycles')
  @ApiOperation({ summary: 'Générer le prochain cycle' })
  @ApiParam({ name: 'id', type: String })
  generateCycle(@Param('id') id: string) {
    return this.cycleService.generateNextCycle(id);
  }

  @Get(':id/cycles')
  @ApiOperation({ summary: 'Lister les cycles d\'une tontine' })
  @ApiParam({ name: 'id', type: String })
  findAllCycles(@Param('id') id: string) {
    return this.cycleService.findAllByTontine(id);
  }

  @Get(':id/cycles/:cycleId')
  @ApiOperation({ summary: 'Obtenir un cycle par ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'cycleId', type: String })
  findOneCycle(@Param('cycleId') cycleId: string) {
    return this.cycleService.findOne(cycleId);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Contribuer à un cycle' })
  @ApiParam({ name: 'id', type: String })
  contribute(
    @Param('id') _id: string,
    @Body('memberId') memberId: string,
    @Body() dto: ContributeDto,
  ) {
    return this.contributionService.contribute(memberId, dto);
  }

  @Get(':id/cycles/:cycleId/contributions')
  @ApiOperation({ summary: 'Lister les contributions d\'un cycle' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'cycleId', type: String })
  findAllContributions(@Param('cycleId') cycleId: string) {
    return this.contributionService.findAllByCycle(cycleId);
  }

  @Post(':id/invitations')
  @ApiOperation({ summary: 'Envoyer une invitation' })
  @ApiParam({ name: 'id', type: String })
  createInvitation(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationService.create(id, req.user.id, dto);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'Lister les invitations d\'une tontine' })
  @ApiParam({ name: 'id', type: String })
  findAllInvitations(@Param('id') id: string) {
    return this.invitationService.findByTontine(id);
  }

  @Patch(':id/invitations/:invitationId/respond')
  @ApiOperation({ summary: 'Répondre à une invitation' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'invitationId', type: String })
  respondInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: { user: { id: number } },
    @Body() dto: RespondInvitationDto,
  ) {
    return this.invitationService.respond(invitationId, req.user.id, dto);
  }

  @Post(':id/payout/:cycleId')
  @ApiOperation({ summary: 'Verser le pot à un bénéficiaire' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'cycleId', type: String })
  processPayout(@Param('cycleId') cycleId: string) {
    return this.payoutService.processPayout(cycleId);
  }
}
