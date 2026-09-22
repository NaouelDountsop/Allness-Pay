import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SupportMessage } from './support-message.entity';

@Entity('support_conversations')
export class SupportConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'agent_id', type: 'int', nullable: true })
  agentId: number | null;

  @Column({ default: 'open' })
  status: string;

  @Column({ type: 'varchar', nullable: true, length: 200 })
  subject: string | null;

  @OneToMany(() => SupportMessage, (msg) => msg.conversation)
  messages: SupportMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
