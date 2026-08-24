import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { TontineMember } from '../tontine/entities/tontine-member.entity';
import { TontineMemberStatus } from '../tontine/enums/tontine-member-status.enum';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MessageRead)
    private readonly messageReadRepo: Repository<MessageRead>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
  ) {}

  async findAll(tontineId: string, userId: number): Promise<Message[]> {
    await this.assertMembership(tontineId, userId);

    return this.messageRepo.find({
      where: { tontineId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    tontineId: string,
    senderId: number,
    dto: CreateMessageDto,
    file?: Express.Multer.File,
  ): Promise<Message> {
    await this.assertMembership(tontineId, senderId);

    const message = this.messageRepo.create({
      tontineId,
      senderId,
      content: dto.content ?? null,
      attachmentUrl: file ? `/uploads/tontines/${file.filename}` : null,
      attachmentName: file?.originalname ?? null,
      isSystem: false,
    });

    return this.messageRepo.save(message);
  }

  async createSystemMessage(tontineId: string, content: string): Promise<Message> {
    const message = this.messageRepo.create({
      tontineId,
      senderId: null,
      content,
      isSystem: true,
    });

    return this.messageRepo.save(message);
  }

  async markAsRead(messageId: string, userId: number): Promise<MessageRead> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    await this.assertMembership(message.tontineId, userId);

    const existing = await this.messageReadRepo.findOne({
      where: { messageId, userId },
    });
    if (existing) {
      return existing;
    }

    const read = this.messageReadRepo.create({ messageId, userId });
    return this.messageReadRepo.save(read);
  }

  async getUnreadCounts(
    tontineId: string,
    userId: number,
  ): Promise<{ total: number; unread: number }> {
    await this.assertMembership(tontineId, userId);

    const total = await this.messageRepo.count({
      where: { tontineId, isSystem: false },
    });

    const readIds = await this.messageReadRepo
      .createQueryBuilder('mr')
      .select('mr."messageId"')
      .where('mr."userId" = :userId', { userId })
      .getMany();

    const readIdsSet = new Set(readIds.map((r) => r.messageId));

    const allMessages = await this.messageRepo.find({
      where: { tontineId, isSystem: false },
      select: ['id'],
    });

    const unread = allMessages.filter((m) => !readIdsSet.has(m.id)).length;

    return { total, unread };
  }

  private async assertMembership(tontineId: string, userId: number): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { tontineId, userId, status: TontineMemberStatus.ACTIVE },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas membre de cette tontine");
    }
  }
}
