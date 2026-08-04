import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TontineFrequency {
  WEEKLY = 'Hebdomadaire',
  MONTHLY = 'Mensuelle',
}

export enum TontineStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('tontines')
export class Tontine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  montantCotisation: number;

  @Column({ type: 'enum', enum: TontineFrequency, default: TontineFrequency.MONTHLY })
  frequence: TontineFrequency;

  @Column({ default: 12 })
  nombreMembres: number;

  @Column({ type: 'enum', enum: TontineStatus, default: TontineStatus.ACTIVE })
  statut: TontineStatus;

  @Column({ default: 0 })
  tourActuel: number;

  @Column({ default: 'XAF' })
  devise: string;

  @Column({ nullable: true })
  lieu: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createurId' })
  createur: User;

  @Column()
  createurId: number;

  @OneToMany(() => TontineMember, (m) => m.tontine, { cascade: true })
  membres: TontineMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('tontine_members')
export class TontineMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tontine, (t) => t.membres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tontineId' })
  tontine: Tontine;

  @Column()
  tontineId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ default: 0 })
  tourOrdre: number;

  @Column({ default: false })
  aPayeTourActuel: boolean;

  @CreateDateColumn()
  dateRejoint: Date;
}
