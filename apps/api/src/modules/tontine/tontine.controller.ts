import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TontineService } from './tontine.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string };
}

@ApiTags('tontine')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('tontine')
export class TontineController {
  constructor(private readonly tontineService: TontineService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tontine' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTontineDto) {
    return this.tontineService.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les tontines de l\'utilisateur' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.tontineService.findByUser(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une tontine' })
  findOne(@Param('id') id: string) {
    return this.tontineService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une tontine' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTontineDto,
  ) {
    return this.tontineService.update(+id, dto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tontine' })
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tontineService.remove(+id, req.user.sub);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre une tontine' })
  join(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tontineService.join(+id, req.user.sub);
  }
}
