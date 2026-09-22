import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportConversation } from './entities/support-conversation.entity';
import { SupportMessage } from './entities/support-message.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateConversationDto,
} from './dto/conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(SupportConversation)
    private readonly convRepo: Repository<SupportConversation>,
    @InjectRepository(SupportMessage)
    private readonly msgRepo: Repository<SupportMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createConversation(userId: number, dto: CreateConversationDto) {
    const conv = this.convRepo.create({ userId, subject: dto.subject });
    const saved = await this.convRepo.save(conv);

    const msg = this.msgRepo.create({
      conversationId: saved.id,
      senderId: userId,
      senderType: 'user',
      content: dto.message,
    });
    await this.msgRepo.save(msg);

    return saved;
  }

  async sendMessage(conversationId: number, senderId: number, senderType: string, dto: SendMessageDto) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation introuvable');

    if (conv.status === 'closed') {
      conv.status = 'open';
      await this.convRepo.save(conv);
    }

    const msg = this.msgRepo.create({
      conversationId,
      senderId,
      senderType,
      content: dto.content,
    });
    return this.msgRepo.save(msg);
  }

  async getConversations(userId?: number, role?: string) {
    const convs = await this.convRepo.find({
      relations: ['messages'],
      order: role === 'admin' ? { updatedAt: 'DESC' } : { createdAt: 'ASC' },
      ...(userId ? { where: { userId } } : {}),
    });

    const userIds = [...new Set(convs.map((c) => c.userId))];
    const users = await this.userRepo.find({
      where: userIds.map((id) => ({ idutilisateur: id })),
      select: ['idutilisateur', 'nom', 'prenom', 'email'],
    });
    const userMap = new Map(users.map((u) => [u.idutilisateur, u]));

    return convs.map((c) => {
      const user = userMap.get(c.userId);
      return {
        ...c,
        userName: user ? `${user.prenom} ${user.nom}` : `User #${c.userId}`,
        userEmail: user?.email ?? null,
        lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1] : null,
        unreadCount: c.messages.filter(
          (m) => !m.read && m.senderType !== (role === 'admin' ? 'admin' : 'user'),
        ).length,
      };
    });
  }

  async getMessages(conversationId: number) {
    return this.msgRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(conversationId: number, senderType: string) {
    const oppositeType = senderType === 'admin' ? 'user' : 'admin';
    await this.msgRepo.update(
      { conversationId, senderType: oppositeType, read: false },
      { read: true },
    );
  }

  async updateConversation(id: number, dto: UpdateConversationDto) {
    await this.convRepo.update(id, dto);
    return this.convRepo.findOne({ where: { id } });
  }

  async getUnreadCounts(userId?: number) {
    const qb = this.convRepo
      .createQueryBuilder('conv')
      .leftJoin(
        'conv.messages',
        'msg',
        'msg.read = :read AND msg.sender_type != :senderType',
        { read: false, senderType: 'user' },
      )
      .addSelect('COUNT(msg.id)', 'unread')
      .groupBy('conv.id');

    if (userId) {
      qb.where('conv.user_id = :userId', { userId });
    }

    const convs = await qb.getRawMany();

    const totalUnread = convs.reduce((sum, c) => sum + parseInt(c.unread, 10), 0);
    return { totalUnread };
  }
}
