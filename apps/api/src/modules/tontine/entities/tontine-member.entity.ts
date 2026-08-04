import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Tontine } from './tontine.entity';
import { User } from '../../users/entities/user.entity';

export enum TontineMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TontineMemberStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  LEFT = 'LEFT',
  REMOVED = 'REMOVED',
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

  @Column({ type: 'enum', enum: TontineMemberRole, default: TontineMemberRole.MEMBER })
  role: TontineMemberRole;

  @Column({ type: 'enum', enum: TontineMemberStatus, default: TontineMemberStatus.ACTIVE })
  status: TontineMemberStatus;

  @Column({ type: 'int', default: 0 })
  tourOrdre: number;

  @Column({ type: 'boolean', default: false })
  aPayeTourActuel: boolean;

  @Column({ type: 'int', nullable: true })
  beneficiaryOrder?: number;

  @Column({ type: 'boolean', default: false })
  hasReceivedPayout: boolean;

  @Column({ type: 'int', default: 0 })
  missedContributions: number;

  @CreateDateColumn()
  dateRejoint: Date;
}
