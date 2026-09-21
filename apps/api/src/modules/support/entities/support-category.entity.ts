import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SupportArticle } from './support-article.entity';

@Entity('support_categories')
export class SupportCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => SupportArticle, (article) => article.category)
  articles: SupportArticle[];

  @CreateDateColumn()
  createdAt: Date;
}
