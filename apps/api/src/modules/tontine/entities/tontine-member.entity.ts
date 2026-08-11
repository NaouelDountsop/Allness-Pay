import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  UpdateDateColumn,
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tontine, (t) => t.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tontineId' })
  tontine: Tontine;

  @Column({ type: 'uuid' })
  tontineId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: TontineMemberRole, default: TontineMemberRole.MEMBER })
  role: TontineMemberRole;

  @Column({ type: 'enum', enum: TontineMemberStatus, default: TontineMemberStatus.PENDING })
  status: TontineMemberStatus;

  @Column({ type: 'int', nullable: true })
  beneficiaryOrder?: number;

  @Column({ type: 'boolean', default: false })
  hasReceivedPayout: boolean;

  @Column({ type: 'int', default: 0 })
  missedContributions: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
