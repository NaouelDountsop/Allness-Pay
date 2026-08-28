import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BeneficiairesService } from './beneficiaire.service';
import { CreateBeneficiaireDto } from './dto/create-beneficiaire.dto';
import { UpdateBeneficiaireDto } from './dto/update-beneficiaire.dto';
import { FilterBeneficiaireDto } from './dto/filter-beneficiaire.dto';

interface AuthenticatedRequest extends Request {
  user: { sub: number };
}

@ApiTags('Bénéficiaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('beneficiaires')
export class BeneficiairesController {
  constructor(private readonly beneficiairesService: BeneficiairesService) {}

  @Get('search')
  @ApiOperation({ summary: "Rechercher un utilisateur AllnessPay pour l'ajouter comme bénéficiaire" })
  search(@Query('q') query: string) {
    return this.beneficiairesService.searchUser(query);
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un bénéficiaire' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateBeneficiaireDto,
  ) {
    return this.beneficiairesService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister / filtrer les bénéficiaires' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() filtre: FilterBeneficiaireDto,
  ) {
    return this.beneficiairesService.findAll(req.user.sub, filtre);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des cartes du haut du module' })
  getStats(@Req() req: AuthenticatedRequest) {
    return this.beneficiairesService.getStats(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un bénéficiaire" })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.beneficiairesService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un bénéficiaire' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeneficiaireDto,
  ) {
    return this.beneficiairesService.update(req.user.sub, id, dto);
  }

  @Patch(':id/favori')
  @ApiOperation({ summary: 'Ajouter/retirer un bénéficiaire des favoris' })
  toggleFavori(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.beneficiairesService.toggleFavori(req.user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un bénéficiaire' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.beneficiairesService.remove(req.user.sub, id);
  }
}
