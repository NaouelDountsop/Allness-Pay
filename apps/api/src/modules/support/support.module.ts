import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportCategory } from './entities/support-category.entity';
import { SupportArticle } from './entities/support-article.entity';
import { SupportQuestion } from './entities/support-question.entity';
import { SupportConversation } from './entities/support-conversation.entity';
import { SupportMessage } from './entities/support-message.entity';
import { User } from '../users/entities/user.entity';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { RolesModule } from '../role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupportCategory,
      SupportArticle,
      SupportQuestion,
      SupportConversation,
      SupportMessage,
      User,
    ]),
    RolesModule,
  ],
  controllers: [SupportController, ConversationController],
  providers: [SupportService, ConversationService],
  exports: [SupportService, ConversationService],
})
export class SupportModule {}
