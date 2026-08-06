import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TontineMember } from './tontine-member.entity';

export enum TontineFrequency {
  WEEKLY = 'Hebdomadaire',
  BIWEEKLY = 'Bimensuelle',
  MONTHLY = 'Mensuelle',
}

export enum TontineStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('tontines')
export class Tontine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  montantCotisation: number;

  @Column({ type: 'enum', enum: TontineFrequency, default: TontineFrequency.MONTHLY })
  frequence: TontineFrequency;

  @Column({ default: 12 })
  nombreMembres: number;

  @Column({ type: 'enum', enum: TontineStatus, default: TontineStatus.DRAFT })
  statut: TontineStatus;

  @Column({ default: 0 })
  tourActuel: number;

  @Column({ default: 'XAF' })
  devise: string;


  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createurId' })
  createur: User;

  @Column()
  createurId: number;

  @OneToMany(() => TontineMember, (m) => m.tontine, { cascade: true })
  membres: TontineMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
