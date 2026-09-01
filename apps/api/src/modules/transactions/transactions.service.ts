import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Wallet, WalletType } from '../wallet/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
} from './entities/wallet-transaction.entity';
import { WalletsService } from '../wallet/wallet.service';
import { PinService } from '../pin/pin.service';
import { CurrencyService } from '../currency/currency.service';
import { LinkedAccountOperator } from '../linked-account/enums/linked-account-operator.enum';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
    private readonly pinService: PinService,
    private readonly currencyService: CurrencyService,
  ) {}

  /**
   * Enregistre un paiement externe (Tranzak, Campay) dans le ledger.
   * Crée une écriture comptable avec statut PENDING.
   */
  async recordExternalPayment(
    data: {
      walletId: string;
      amount: number;
      operator: LinkedAccountOperator | null;
      phoneNumber: string;
      description: string;
      provider: string;
      providerRequestId: string;
      providerTransactionId?: string | null;
      reference?: string | null;
    },
    manager?: EntityManager,
  ): Promise<WalletTransaction> {
    const run = async (em: EntityManager) => {
      const wallet = await this.walletsService.lockWalletForUpdate(em, data.walletId);
      this.walletsService.assertActive(wallet);
      this.assertNotTontine(wallet);

      const entry = em.create(WalletTransaction, {
        walletId: data.walletId,
        type: WalletTransactionType.DEPOSIT,
        amount: data.amount,
        operator: data.operator,
        phoneNumber: data.phoneNumber,
        description: data.description,
        provider: data.provider,
        providerRequestId: data.providerRequestId,
        providerTransactionId: data.providerTransactionId ?? null,
        reference: data.reference ?? null,
        status: WalletTransactionStatus.PENDING,
      });
      await em.save(entry);

      return entry;
    };

    return manager ? run(manager) : this.dataSource.transaction(run);
  }

  /**
   * Confirme ou échoue un paiement externe.
   * Recherche par providerRequestId ou providerTransactionId.
   * Idempotent : ignore si déjà COMPLETED.
   * Recalcule le solde du wallet après confirmation.
   */
  async confirmExternalPayment(
    provider: string,
    identifier: string,
    newStatus: WalletTransactionStatus.COMPLETED | WalletTransactionStatus.FAILED,
    isRequestId: boolean,
  ): Promise<WalletTransaction> {
    return this.dataSource.transaction(async (manager) => {
      const lookupField = isRequestId ? 'providerRequestId' : 'providerTransactionId';
      const transaction = await manager.findOne(WalletTransaction, {
        where: { provider, [lookupField]: identifier },
      });

      if (!transaction) {
        throw new BadRequestException(`Transaction ${provider}:${identifier} introuvable`);
      }

      if (transaction.status === WalletTransactionStatus.COMPLETED) {
        return transaction;
      }

      transaction.status = newStatus;
      await manager.save(transaction);

      const newBalance = await this.recalculateBalance(manager, transaction.walletId);
      await manager.update(Wallet, { id: transaction.walletId }, { balance: newBalance.toFixed(2) });

      return transaction;
    });
  }

  async transfer(
    fromId: string,
    userId: number,
    dto: TransferDto,
  ): Promise<{ from: Wallet; to: Wallet }> {
    // Résoudre le wallet bénéficiaire (UUID ou walletNumber)
    const toWalletEntity = await this.walletsService.findByWalletNumber(dto.toWalletId);
    const toId = toWalletEntity.id;

    if (fromId === toId) {
      throw new BadRequestException('Impossible de transférer vers le même wallet');
    }

    return this.dataSource.transaction(async (manager) => {
      const [firstId, secondId] = [fromId, toId].sort();
      await this.walletsService.lockWalletForUpdate(manager, firstId);
      await this.walletsService.lockWalletForUpdate(manager, secondId);

      const fromWallet = await this.pinService.verifyPinWithManager(
        manager,
        fromId,
        userId,
        dto.pin,
      );
      this.walletsService.assertActive(fromWallet);
      this.assertNotTontine(fromWallet);

      const toWallet = await this.walletsService.lockWalletForUpdate(manager, toId);
      this.walletsService.assertActive(toWallet);
      this.assertNotTontine(toWallet);

      if (toWallet.userId === userId) {
        throw new BadRequestException('Vous ne pouvez pas transférer vers votre propre wallet');
      }

      const senderAmount = Number(dto.amount);
      if (Number(fromWallet.balance) < senderAmount) {
        throw new BadRequestException('Solde insuffisant');
      }

      let receiverAmount = senderAmount;
      if (fromWallet.currency !== toWallet.currency) {
        const conversion = await this.currencyService.convertAmount(
          senderAmount,
          fromWallet.currency,
          toWallet.currency,
        );
        receiverAmount = Math.round(conversion.amount * 100) / 100;
      }

      const outEntry = manager.create(WalletTransaction, {
        walletId: fromId,
        type: WalletTransactionType.TRANSFER_OUT,
        amount: senderAmount,
        relatedWalletId: toId,
        description: dto.description ?? `Transfert vers ${toId}`,
        reference: 'allnesspay',
      });
      const inEntry = manager.create(WalletTransaction, {
        walletId: toId,
        type: WalletTransactionType.TRANSFER_IN,
        amount: receiverAmount,
        relatedWalletId: fromId,
        description: dto.description ?? `Transfert depuis ${fromId}`,
        reference: 'allnesspay',
      });
      await manager.save([outEntry, inEntry]);

      const [newFromBalance, newToBalance] = await Promise.all([
        this.recalculateBalance(manager, fromId),
        this.recalculateBalance(manager, toId),
      ]);
      await manager.update(Wallet, { id: fromId }, { balance: newFromBalance.toFixed(2) });
      await manager.update(Wallet, { id: toId }, { balance: newToBalance.toFixed(2) });

      const [updatedFrom, updatedTo] = await Promise.all([
        manager.findOneOrFail(Wallet, { where: { id: fromWallet.id } }),
        manager.findOneOrFail(Wallet, { where: { id: toWallet.id } }),
      ]);

      return { from: updatedFrom, to: updatedTo };
    });
  }

  async listByWallet(walletId: string) {
    const transactions = await this.dataSource
      .getRepository(WalletTransaction)
      .createQueryBuilder('wt')
      .leftJoinAndSelect('wt.relatedWallet', 'relatedWallet')
      .leftJoinAndSelect('relatedWallet.user', 'relatedUser')
      .where('wt.walletId = :walletId', { walletId })
      .orderBy('wt.createdAt', 'DESC')
      .getMany();

    return transactions.map((t) => {
      const plain = {
        id: t.id,
        walletId: t.walletId,
        type: t.type,
        amount: t.amount,
        relatedWalletId: t.relatedWalletId,
        reference: t.reference,
        description: t.description,
        status: t.status,
        provider: t.provider,
        operator: t.operator,
        phoneNumber: t.phoneNumber,
        createdAt: t.createdAt,
        counterpartyName: null as string | null,
        counterpartyPhone: null as string | null,
      };

      if (t.relatedWallet?.user) {
        const user = t.relatedWallet.user as any;
        plain.counterpartyName = [user.prenom, user.nom].filter(Boolean).join(' ') || null;
        plain.counterpartyPhone = user.telephone ?? null;
      }

      return plain;
    });
  }

  async getMonthlySummary(walletId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentMonthResult = await this.dataSource
      .getRepository(WalletTransaction)
      .createQueryBuilder('tx')
      .select(
        `SUM(CASE WHEN tx.type IN ('deposit', 'transfer_in') AND tx.status = '${WalletTransactionStatus.COMPLETED}' THEN tx.amount ELSE 0 END)`,
        'income',
      )
      .addSelect(
        `SUM(CASE WHEN tx.type IN ('withdrawal', 'transfer_out') AND tx.status IN ('${WalletTransactionStatus.COMPLETED}', '${WalletTransactionStatus.PENDING}') THEN tx.amount ELSE 0 END)`,
        'expense',
      )
      .where('tx.walletId = :walletId', { walletId })
      .andWhere('tx.createdAt >= :start', { start: startOfMonth.toISOString() })
      .getRawOne();

    const income = Number(currentMonthResult?.income ?? 0);
    const expense = Number(currentMonthResult?.expense ?? 0);
    const total = income + expense;
    const incomePercent = total > 0 ? Math.round((income / total) * 100) : 0;
    const expensePercent = total > 0 ? 100 - incomePercent : 0;

    const months: Array<{ month: string; income: number; expense: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const result = await this.dataSource
        .getRepository(WalletTransaction)
        .createQueryBuilder('tx')
        .select(
          `SUM(CASE WHEN tx.type IN ('deposit', 'transfer_in') THEN tx.amount ELSE 0 END)`,
          'income',
        )
        .addSelect(
          `SUM(CASE WHEN tx.type IN ('withdrawal', 'transfer_out') THEN tx.amount ELSE 0 END)`,
          'expense',
        )
        .where('tx.walletId = :walletId', { walletId })
        .andWhere('tx.status = :status', { status: WalletTransactionStatus.COMPLETED })
        .andWhere('tx.createdAt >= :start AND tx.createdAt <= :end', {
          start: d.toISOString(),
          end: monthEnd.toISOString(),
        })
        .getRawOne();
      months.push({
        month: label,
        income: Number(result?.income ?? 0),
        expense: Number(result?.expense ?? 0),
      });
    }

    return {
      month: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      income,
      expense,
      net: income - expense,
      incomePercent,
      expensePercent,
      trend: months,
    };
  }

  private async recalculateBalance(manager: EntityManager, walletId: string): Promise<number> {
    const result = await manager
      .createQueryBuilder(WalletTransaction, 'wt')
      .select(
        `COALESCE(
          SUM(
            CASE
              WHEN wt.type IN ('deposit', 'transfer_in')
                AND wt.status = '${WalletTransactionStatus.COMPLETED}'
              THEN CAST(wt.amount AS numeric)
              ELSE 0
            END
          )
          - SUM(
            CASE
              WHEN wt.type IN ('withdrawal', 'transfer_out')
                AND wt.status IN ('${WalletTransactionStatus.COMPLETED}', '${WalletTransactionStatus.PENDING}')
              THEN CAST(wt.amount AS numeric)
              ELSE 0
            END
          ),
          0
        )`,
        'balance',
      )
      .where('wt.walletId = :walletId', { walletId })
      .getRawOne<{ balance: string }>();

    return Number(result?.balance ?? 0);
  }

  private assertNotTontine(wallet: Wallet): void {
    if (wallet.type === WalletType.TONTINE) {
      throw new BadRequestException(
        'Les opérations sur un portefeuille tontine ne passent pas par ici.',
      );
    }
  }
}
