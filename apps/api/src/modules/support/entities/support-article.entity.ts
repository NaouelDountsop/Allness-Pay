import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SupportCategory } from './support-category.entity';
import { SupportQuestion } from './support-question.entity';

@Entity('support_articles')
export class SupportArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => SupportCategory, (cat) => cat.articles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: SupportCategory;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => SupportQuestion, (q) => q.article)
  questions: SupportQuestion[];

  @CreateDateColumn()
  createdAt: Date;
}
