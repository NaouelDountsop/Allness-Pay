import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateConversationDto,
} from './dto/conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../role/guards/permissions.guards';
import { RequirePermissions } from '../role/decorators/permissions.decorator';

@ApiTags('support-conversations')
@Controller('support/conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer une conversation de support' })
  create(@Request() req: { user: { sub: number } }, @Body() dto: CreateConversationDto) {
    return this.conversationService.createConversation(req.user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lister les conversations (admin: toutes, user: les siennes)' })
  findAll(@Request() req: { user: { sub: number; role?: string } }) {
    const role = (req.user as { role?: string }).role;
    const isAdmin = role === 'admin' || role === 'super-admin';
    return this.conversationService.getConversations(
      isAdmin ? undefined : req.user.sub,
      isAdmin ? 'admin' : 'user',
    );
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Nombre de messages non lus (utilisateur)' })
  getUnread(@Request() req: { user: { sub: number; role?: string } }) {
    const role = (req.user as { role?: string }).role;
    const isAdmin = role === 'admin' || role === 'super-admin';
    return this.conversationService.getUnreadCounts(isAdmin ? undefined : req.user.sub);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Récupérer les messages d\'une conversation' })
  getMessages(@Param('id') id: string) {
    return this.conversationService.getMessages(+id);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Envoyer un message dans une conversation' })
  sendMessage(
    @Param('id') id: string,
    @Request() req: { user: { sub: number; role?: string } },
    @Body() dto: SendMessageDto,
  ) {
    const role = (req.user as { role?: string }).role;
    const senderType = role === 'admin' || role === 'super-admin' ? 'admin' : 'user';
    return this.conversationService.sendMessage(+id, req.user.sub, senderType, dto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Marquer les messages comme lus' })
  markAsRead(
    @Param('id') id: string,
    @Request() req: { user: { role?: string } },
  ) {
    const role = (req.user as { role?: string }).role;
    const senderType = role === 'admin' || role === 'super-admin' ? 'admin' : 'user';
    return this.conversationService.markAsRead(+id, senderType);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour une conversation (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateConversationDto) {
    return this.conversationService.updateConversation(+id, dto);
  }
}
