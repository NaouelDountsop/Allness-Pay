import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import { Tontine } from './tontine.entity';
import { TontineContribution } from './tontine-contribution.entity';

@Entity('tontine_cycles')
export class TontineCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tontineId: string;

  @ManyToOne(() => Tontine, { onDelete: 'CASCADE' })
  tontine: Tontine;

  @Column({ type: 'int' })
  cycleNumber: number;

  @Column({ type: 'uuid' })
  beneficiaryId: string;

  @Column({ type: 'enum', enum: TontineCycleStatus, default: TontineCycleStatus.PENDING })
  status: TontineCycleStatus;

  @Column({ type: 'bigint' })
  totalPot: string;

  @Column({ type: 'bigint', default: '0' })
  collectedAmount: string;

  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => TontineContribution, (contribution) => contribution.cycle, { cascade: true })
  contributions: TontineContribution[];
}
