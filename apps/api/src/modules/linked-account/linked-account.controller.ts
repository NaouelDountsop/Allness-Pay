import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request as Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LinkedAccountsService } from './linked-account.service';
import { CreateLinkedAccountDto } from './dto/create-linked-account.dto';
import { UpdateLinkedAccountDto } from './dto/update-linked-account.dto';
import { VerifyLinkedAccountDto } from './dto/verify-linked-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('linked-accounts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('linked-accounts')
export class LinkedAccountsController {
  constructor(private readonly linkedAccountsService: LinkedAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Lier un compte externe (bancaire ou Mobile Money)' })
  create(@Body() createLinkedAccountDto: CreateLinkedAccountDto, @Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.linkedAccountsService.create(user.idutilisateur, createLinkedAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les comptes liés' })
  findAll(@Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.linkedAccountsService.findAllForUser(user.idutilisateur);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'un compte lié" })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.linkedAccountsService.findOne(id, user.idutilisateur);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un compte lié' })
  update(
    @Param('id') id: string,
    @Body() updateLinkedAccountDto: UpdateLinkedAccountDto,
    @Req() req: Request,
  ) {
    const user = req.user as { idutilisateur: number };
    return this.linkedAccountsService.update(id, user.idutilisateur, updateLinkedAccountDto);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Définir comme compte par défaut' })
  setDefault(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.linkedAccountsService.setDefault(id, user.idutilisateur);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Vérifier un compte avec le code reçu' })
  verify(@Param('id') id: string, @Body() verifyDto: VerifyLinkedAccountDto, @Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.linkedAccountsService.verify(id, user.idutilisateur, verifyDto.code);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un compte lié' })
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { idutilisateur: number };
    return this.linkedAccountsService.remove(id, user.idutilisateur);
  }
}
