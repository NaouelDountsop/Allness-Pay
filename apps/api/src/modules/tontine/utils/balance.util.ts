import type { EntityManager } from 'typeorm';
import { WalletTransaction } from '../../transactions/entities/wallet-transaction.entity';

export async function recalculateBalance(manager: EntityManager, walletId: string): Promise<bigint> {
  const result = await manager
    .createQueryBuilder(WalletTransaction, 'wt')
    .select(
      `COALESCE(
        SUM(CASE WHEN wt.type IN ('deposit', 'transfer_in') THEN wt.amount ELSE 0 END)
        - SUM(CASE WHEN wt.type IN ('withdrawal', 'transfer_out') THEN wt.amount ELSE 0 END),
        0
      )`,
      'balance',
    )
    .where('wt.walletId = :walletId', { walletId })
    .getRawOne<{ balance: string }>();

  return BigInt(result?.balance ?? '0');
}
