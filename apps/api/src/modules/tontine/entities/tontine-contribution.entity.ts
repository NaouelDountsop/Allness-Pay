import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';
import { TontineCycle } from './tontine-cycle.entity';

@Entity('tontine_contributions')
export class TontineContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cycleId: string;

  @ManyToOne(() => TontineCycle, (cycle) => cycle.contributions, { onDelete: 'CASCADE' })
  cycle: TontineCycle;

  @Column({ type: 'uuid' })
  memberId: string;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({
    type: 'enum',
    enum: TontineContributionStatus,
    default: TontineContributionStatus.PENDING,
  })
  status: TontineContributionStatus;

  @Column({ type: 'uuid', nullable: true })
  walletTransactionId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ type: 'int', default: 0 })
  penaltyCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
