import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TontineMemberRole } from '../enums/tontine-member-role.enum';
import { TontineMemberStatus } from '../enums/tontine-member-status.enum';
import { Tontine } from './tontine.entity';

@Entity('tontine_members')
export class TontineMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tontineId: string;

  @ManyToOne(() => Tontine, (tontine) => tontine.members, { onDelete: 'CASCADE' })
  tontine: Tontine;

  @Column({ type: 'int' })
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
