import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TontineMember } from '../tontine/entities/tontine-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageRead, TontineMember]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessagingModule {}
