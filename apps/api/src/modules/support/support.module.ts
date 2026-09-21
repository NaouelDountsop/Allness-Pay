import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportCategory } from './entities/support-category.entity';
import { SupportArticle } from './entities/support-article.entity';
import { SupportQuestion } from './entities/support-question.entity';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { RolesModule } from '../role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportCategory, SupportArticle, SupportQuestion]),
    RolesModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
