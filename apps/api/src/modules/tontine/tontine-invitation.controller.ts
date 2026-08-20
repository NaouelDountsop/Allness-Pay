import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitationService } from './services/invitation.service';
import { RespondInvitationDto } from './dto/respond-invitation.dto';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string };
}

@ApiTags('Tontine Invitations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tontines/invitations')
export class TontineInvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get()
  @ApiOperation({ summary: "Lister toutes les invitations de l'utilisateur" })
  listAllMyInvitations(@Req() req: AuthenticatedRequest) {
    return this.invitationService.findAllByUserId(req.user.sub);
  }

  @Get('pending')
  @ApiOperation({ summary: "Lister les invitations en attente de l'utilisateur" })
  listPendingInvitations(@Req() req: AuthenticatedRequest) {
    return this.invitationService.findPendingByUserId(req.user.sub);
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accepter une invitation par token (lien email)' })
  acceptByToken(@Req() req: AuthenticatedRequest, @Body('token') token: string) {
    return this.invitationService.acceptByToken(token, req.user.sub);
  }

  @Post(':invitationId/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Répondre à une invitation' })
  @ApiParam({ name: 'invitationId', type: String })
  respondInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RespondInvitationDto,
  ) {
    return this.invitationService.respond(invitationId, req.user.sub, dto);
  }
}
