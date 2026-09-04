import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { tontineMulterConfig } from '../../common/config/tontine-multer.config';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string };
}

@ApiTags('Tontine Messages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tontines/:tontineId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les messages d une tontine' })
  @ApiParam({ name: 'tontineId', type: String })
  findAll(
    @Param('tontineId', ParseUUIDPipe) tontineId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.messageService.findAll(tontineId, req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Envoyer un message (texte et/ou fichier)' })
  @ApiParam({ name: 'tontineId', type: String })
  @UseInterceptors(FileInterceptor('file', tontineMulterConfig))
  create(
    @Param('tontineId', ParseUUIDPipe) tontineId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.messageService.create(tontineId, req.user.sub, dto, file);
  }

  @Post(':messageId/read')
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  @ApiParam({ name: 'tontineId', type: String })
  @ApiParam({ name: 'messageId', type: String })
  markAsRead(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.messageService.markAsRead(messageId, req.user.sub);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Nombre de messages non lus' })
  @ApiParam({ name: 'tontineId', type: String })
  getUnreadCounts(
    @Param('tontineId', ParseUUIDPipe) tontineId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.messageService.getUnreadCounts(tontineId, req.user.sub);
  }
}
