import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportCategory } from './entities/support-category.entity';
import { SupportArticle } from './entities/support-article.entity';
import { SupportQuestion } from './entities/support-question.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { CreateQuestionDto } from './dto/question.dto';

export interface SearchResult {
  article: SupportArticle;
  score: number;
  matchedQuestion: string | null;
}

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportCategory)
    private readonly categoryRepo: Repository<SupportCategory>,
    @InjectRepository(SupportArticle)
    private readonly articleRepo: Repository<SupportArticle>,
    @InjectRepository(SupportQuestion)
    private readonly questionRepo: Repository<SupportQuestion>,
  ) {}

  // --- Categories ---

  createCategory(dto: CreateCategoryDto): Promise<SupportCategory> {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  findAllCategories(): Promise<SupportCategory[]> {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async findCategoryById(id: string): Promise<SupportCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Catégorie introuvable');
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<SupportCategory> {
    const category = await this.findCategoryById(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    await this.categoryRepo.remove(category);
  }

  // --- Articles ---

  async createArticle(dto: CreateArticleDto): Promise<SupportArticle> {
    await this.findCategoryById(dto.categoryId);
    const article = this.articleRepo.create({
      categoryId: dto.categoryId,
      title: dto.title,
      content: dto.content,
    });
    const saved = await this.articleRepo.save(article);

    if (dto.keywords?.length) {
      const questions = dto.keywords.map((kw) =>
        this.questionRepo.create({
          articleId: saved.id,
          question: kw,
          keywords: [kw],
        }),
      );
      await this.questionRepo.save(questions);
    }

    return this.articleRepo.findOne({
      where: { id: saved.id },
      relations: ['questions', 'category'],
    }) as Promise<SupportArticle>;
  }

  findAllArticles(): Promise<SupportArticle[]> {
    return this.articleRepo.find({
      relations: ['category', 'questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findArticleById(id: string): Promise<SupportArticle> {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ['questions', 'category'],
    });
    if (!article) throw new NotFoundException('Article introuvable');
    return article;
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<SupportArticle> {
    const article = await this.findArticleById(id);
    Object.assign(article, dto);
    await this.articleRepo.save(article);
    return this.findArticleById(id);
  }

  async removeArticle(id: string): Promise<void> {
    const article = await this.findArticleById(id);
    await this.articleRepo.remove(article);
  }

  // --- Questions ---

  async addQuestion(articleId: string, dto: CreateQuestionDto): Promise<SupportQuestion> {
    await this.findArticleById(articleId);
    const question = this.questionRepo.create({
      articleId,
      question: dto.question,
      keywords: dto.keywords ?? [],
    });
    return this.questionRepo.save(question);
  }

  async removeQuestion(id: string): Promise<void> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Question introuvable');
    await this.questionRepo.remove(question);
  }

  // --- Search ---

  async search(query: string): Promise<SearchResult[]> {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (terms.length === 0) return [];

    const questions = await this.questionRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.article', 'article')
      .leftJoinAndSelect('article.category', 'category')
      .where('article.active = :active', { active: true })
      .andWhere('category.active = :active', { active: true })
      .getMany();

    const results: SearchResult[] = [];

    for (const question of questions) {
      const qText = question.question.toLowerCase();
      const qKeywords = (question.keywords ?? []).map((k) => k.toLowerCase());
      let score = 0;

      for (const term of terms) {
        if (qText.includes(term)) score += 2;
        if (qKeywords.some((k) => k.includes(term))) score += 3;
      }

      if (score > 0) {
        results.push({
          article: question.article,
          score,
          matchedQuestion: question.question,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 5);
  }
}
