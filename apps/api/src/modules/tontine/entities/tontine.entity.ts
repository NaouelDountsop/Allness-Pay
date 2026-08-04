import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { bigintTransformer } from '../../../common/transformers/bigint.transformer';
import { TontineFrequency } from '../enums/tontine-frequency.enum';
import { TontineStatus } from '../enums/tontine-status.enum';
import { TontineMember } from './tontine-member.entity';
import { TontineCycle } from './tontine-cycle.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';

@Entity('tontines')
export class Tontine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  targetAmount: string;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  contributionAmount: string;

  @Column({ type: 'int' })
  memberLimit: number;

  @Column({ type: 'varchar', length: 10, default: 'XAF' })
  currency: string;

  @Column({ type: 'enum', enum: TontineFrequency })
  frequency: TontineFrequency;

  @Column({ type: 'enum', enum: TontineStatus, default: TontineStatus.DRAFT })
  status: TontineStatus;

  @Column({ type: 'int', default: 0 })
  currentCycle: number;

  @Column({ type: 'timestamptz', nullable: true })
  nextContributionAt?: Date;

  @Column({ type: 'int' })
  creatorId: number;

  @Column({ type: 'uuid' })
  walletId: string;

  @OneToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @OneToMany(() => TontineMember, (member) => member.tontine, { cascade: true })
  members: TontineMember[];

  @OneToMany(() => TontineCycle, (cycle) => cycle.tontine, { cascade: true })
  cycles: TontineCycle[];
}
