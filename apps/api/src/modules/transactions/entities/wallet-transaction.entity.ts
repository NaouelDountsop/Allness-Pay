import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';

import { LinkedAccountOperator } from '../../linked-account/enums/linked-account-operator.enum';

export enum WalletTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('wallet_transactions')
@Index(['walletId', 'createdAt'])
@Index(['type'])
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  walletId: string;

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: WalletTransactionType })
  type: WalletTransactionType;

  /** Montant en devise (ex: 0.35 CAD, 500 XAF), toujours positif. */
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  /** Wallet lié pour les transferts (source ou destination). */
  @Column({ type: 'varchar', nullable: true })
  relatedWalletId: string | null;

  @ManyToOne(() => Wallet, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'relatedWalletId' })
  relatedWallet: Wallet | null;

  /** Identifiant de référence externe (opérateur paiement, batch, etc.). */
  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  /** Fournisseur de paiement externe : TRANZAK, CAMPAY, etc. */
  @Column({ type: 'varchar', nullable: true })
  provider: string | null;

  /** Identifiant de la demande chez le fournisseur. */
  @Column({ type: 'varchar', nullable: true })
  providerRequestId: string | null;

  /** Identifiant de la transaction exécutée chez le fournisseur. */
  @Column({ type: 'varchar', nullable: true })
  providerTransactionId: string | null;

  /** Opérateur mobile money utilisé (MTN, Orange, etc.). */
  @Column({ type: 'enum', enum: LinkedAccountOperator, nullable: true })
  operator: LinkedAccountOperator | null;

  /** Numéro de téléphone utilisé pour l'opération mobile money. */
  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;

  /** Description lisible de l'opération. */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Statut de la transaction (pending, completed, failed, cancelled). */
  @Column({
    type: 'enum',
    enum: WalletTransactionStatus,
    default: WalletTransactionStatus.COMPLETED,
  })
  status: WalletTransactionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
