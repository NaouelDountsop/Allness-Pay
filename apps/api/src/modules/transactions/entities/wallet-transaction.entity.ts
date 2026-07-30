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
import { bigintTransformer } from '../../../common/transformers/bigint.transformer';

export enum WalletTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
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

  /** Montant en centimes FCFA, toujours positif. */
  @Column({ type: 'bigint', transformer: bigintTransformer })
  amount: bigint;

  /** Wallet lié pour les transferts (source ou destination). */
  @Column({ type: 'varchar', nullable: true })
  relatedWalletId: string | null;

  @ManyToOne(() => Wallet, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'relatedWalletId' })
  relatedWallet: Wallet | null;

  /** Identifiant de référence externe (opérateur paiement, batch, etc.). */
  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  /** Description lisible de l'opération. */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
