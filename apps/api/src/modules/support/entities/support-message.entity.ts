import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupportConversation } from './support-conversation.entity';

@Entity('support_messages')
export class SupportMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @ManyToOne(() => SupportConversation, (conv) => conv.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: SupportConversation;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'sender_type', default: 'user' })
  senderType: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
