import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { LinkedAccountType } from '../enums/linked-account-type.enum';
import { LinkedAccountOperator } from '../enums/linked-account-operator.enum';
import { LinkedAccountStatus } from '../enums/linked-account-status.enum';

@Entity('linked_accounts')
export class LinkedAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: number;

  @Exclude()
  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ type: 'uuid' })
  walletId: string;

  @Exclude()
  @ApiHideProperty()
  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: LinkedAccountType })
  type: LinkedAccountType;

  @Column({ type: 'enum', enum: LinkedAccountOperator })
  operator: LinkedAccountOperator;

  @Column({ length: 100 })
  label: string;

  @Column({ length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 50, nullable: true })
  accountNumber: string;

  @Column({ length: 100, nullable: true })
  bankName: string;

  @Column({ length: 50, nullable: true })
  iban: string;

  @Column({ length: 20, nullable: true })
  swiftCode: string;

  @Column({ length: 20, default: 'XAF' })
  currency: string;

  @Column({ type: 'enum', enum: LinkedAccountStatus, default: LinkedAccountStatus.PENDING })
  status: LinkedAccountStatus;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  @ApiHideProperty()
  verificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ default: 0 })
  failedVerificationAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  @ApiHideProperty()
  externalAccountId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
