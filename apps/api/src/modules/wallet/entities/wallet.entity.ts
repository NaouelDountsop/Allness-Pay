import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  walletNumber: string;

  @Exclude()
  @ApiHideProperty()
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ insert: false, update: false })
  userId: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance: string;

  @Column({ default: 'XAF' })
  currency: string;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ nullable: true })
  label: string;

  @Exclude()
  @ApiHideProperty()
  @Column({ nullable: true, select: false })
  pinHash: string;

  @Column({ type: 'timestamp', nullable: true })
  pinCreatedAt: Date | null;

  @Exclude()
  @ApiHideProperty()
  @Column({ default: 0 })
  failedPinAttempts: number;

  @Exclude()
  @ApiHideProperty()
  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @VersionColumn()
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}