import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { CreateQuestionDto } from './dto/question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../role/guards/permissions.guards';
import { RequirePermissions } from '../role/decorators/permissions.decorator';

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // --- Categories (admin) ---

  @Post('categories')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer une catégorie de support' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.supportService.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lister les catégories de support' })
  findAllCategories() {
    return this.supportService.findAllCategories();
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Modifier une catégorie' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.supportService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  removeCategory(@Param('id') id: string) {
    return this.supportService.removeCategory(id);
  }

  // --- Articles (admin) ---

  @Post('articles')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un article de support' })
  createArticle(@Body() dto: CreateArticleDto) {
    return this.supportService.createArticle(dto);
  }

  @Get('articles')
  @ApiOperation({ summary: 'Lister les articles de support' })
  findAllArticles() {
    return this.supportService.findAllArticles();
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Obtenir un article par ID' })
  findArticleById(@Param('id') id: string) {
    return this.supportService.findArticleById(id);
  }

  @Patch('articles/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Modifier un article' })
  updateArticle(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.supportService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un article' })
  removeArticle(@Param('id') id: string) {
    return this.supportService.removeArticle(id);
  }

  // --- Questions (admin) ---

  @Post('articles/:articleId/questions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ajouter une question à un article' })
  addQuestion(
    @Param('articleId') articleId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.supportService.addQuestion(articleId, dto);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('roles:manage')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une question' })
  removeQuestion(@Param('id') id: string) {
    return this.supportService.removeQuestion(id);
  }

  // --- Search (public) ---

  @Get('search')
  @ApiOperation({ summary: 'Rechercher dans la base de connaissances' })
  @ApiQuery({ name: 'q', example: 'comment envoyer argent' })
  search(@Query('q') q: string) {
    return this.supportService.search(q);
  }
}
