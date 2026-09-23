import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupportArticle } from './support-article.entity';

@Entity('support_questions')
export class SupportQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  articleId: string;

  @ManyToOne(() => SupportArticle, (article) => article.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId' })
  article: SupportArticle;

  @Column()
  question: string;

  @Column({ type: 'simple-array', nullable: true })
  keywords: string[];

  @CreateDateColumn()
  createdAt: Date;
}
