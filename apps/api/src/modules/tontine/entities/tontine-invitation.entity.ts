import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tontine } from './tontine.entity';

@Entity('tontine_invitations')
export class TontineInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tontineId: string;

  @ManyToOne(() => Tontine, { onDelete: 'CASCADE' })
  tontine: Tontine;

  @Column({ type: 'int' })
  inviterUserId: number;

  @Column({ type: 'int', nullable: true })
  inviteeUserId?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  inviteeEmail?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
