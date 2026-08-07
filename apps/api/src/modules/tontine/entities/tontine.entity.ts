import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TontineMember } from './tontine-member.entity';

export enum TontineFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum TontineStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('tontines')
export class Tontine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  targetAmount: string;

  @Column({ type: 'bigint' })
  contributionAmount: string;

  @Column({ type: 'int' })
  memberLimit: number;

  @Column({ length: 10, default: 'XAF' })
  currency: string;

  @Column({ type: 'enum', enum: TontineFrequency, default: TontineFrequency.MONTHLY })
  frequency: TontineFrequency;

  @Column({ type: 'enum', enum: TontineStatus, default: TontineStatus.DRAFT })
  status: TontineStatus;

  @Column({ type: 'int', default: 0 })
  currentCycle: number;

  @Column({ type: 'timestamptz', nullable: true })
  nextContributionAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet: User;

  @Column({ type: 'uuid', nullable: true })
  walletId: string | null;

  @OneToMany(() => TontineMember, (m) => m.tontine, { cascade: true })
  membres: TontineMember[];

  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
