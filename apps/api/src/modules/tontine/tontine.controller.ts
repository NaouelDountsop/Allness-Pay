import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TontineService } from './tontine.service';
import { InvitationService } from './services/invitation.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
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
    private readonly invitationService: InvitationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tontine' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTontineDto) {
    return this.tontineService.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les tontines de l\'utilisateur' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.tontineService.findAll(req.user.sub);
  }

  @Get('invitations/pending')
  @ApiOperation({ summary: 'Lister les invitations en attente de l\'utilisateur' })
  findPendingInvitations(@Req() req: AuthenticatedRequest) {
    return this.invitationService.findPendingByUserId(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une tontine par ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.tontineService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une tontine (DRAFT uniquement)' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateTontineDto,
  ) {
    return this.tontineService.update(id, dto, req.user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Changer le statut d\'une tontine' })
  @ApiParam({ name: 'id', type: Number })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body('status') status: TontineStatus,
  ) {
    return this.tontineService.updateStatus(id, req.user.sub, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une tontine (DRAFT uniquement)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.tontineService.remove(id, req.user.sub);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Ajouter un membre à la tontine' })
  @ApiParam({ name: 'id', type: Number })
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddMemberDto,
  ) {
    return this.tontineService.addMember(id, req.user.sub, dto.userId);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer un membre de la tontine' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'memberId', type: Number })
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tontineService.removeMember(id, req.user.sub, memberId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre une tontine' })
  @ApiParam({ name: 'id', type: Number })
  join(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.tontineService.join(id, req.user.sub);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quitter une tontine (membres non-admin)' })
  @ApiParam({ name: 'id', type: Number })
  leave(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.tontineService.leave(id, req.user.sub);
  }

  @Post(':id/invitations')
  @ApiOperation({ summary: 'Envoyer une invitation à rejoindre la tontine' })
  @ApiParam({ name: 'id', type: Number })
  createInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationService.create(id, req.user.sub, dto);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'Lister les invitations d\'une tontine' })
  @ApiParam({ name: 'id', type: Number })
  listInvitations(@Param('id', ParseIntPipe) id: number) {
    return this.invitationService.findByTontine(id);
  }

  @Post('invitations/:invitationId/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Répondre à une invitation' })
  @ApiParam({ name: 'invitationId', type: Number })
  respondInvitation(
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RespondInvitationDto,
  ) {
    return this.invitationService.respond(invitationId, req.user.sub, dto);
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accepter une invitation par token (lien email)' })
  acceptByToken(
    @Req() req: AuthenticatedRequest,
    @Body('token') token: string,
  ) {
    return this.invitationService.acceptByToken(token, req.user.sub);
  }
}
