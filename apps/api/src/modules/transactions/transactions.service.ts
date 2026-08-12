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
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet-operation.dto';
import { detectOperator } from '../../common/utils/phone-operator.util';
import { LinkedAccountOperator } from '../linked-account/enums/linked-account-operator.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly walletsService: WalletsService,
    private readonly pinService: PinService,
  ) {}

  async deposit(id: string, userId: number, dto: DepositDto): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await this.walletsService.lockWalletForUpdate(manager, id);
      this.walletsService.assertOwnership(wallet, userId);
      this.walletsService.assertActive(wallet);
      this.assertNotTontine(wallet);

      const amount = BigInt(dto.amount);
      const operator = detectOperator(dto.phone_number);

      if (!operator) {
        throw new BadRequestException(
          'Numéro de téléphone non reconnu. Seuls les préfixes MTN (650-659) et Orange (690-699) sont acceptés.',
        );
      }

      // Écriture comptable immutable
      const entry = manager.create(WalletTransaction, {
        walletId: id,
        type: WalletTransactionType.DEPOSIT,
        amount,
        description: dto.description ?? 'Dépôt',
        operator,
        phoneNumber: dto.phone_number,
      });
      await manager.save(entry);

      // Recalcul du solde (projection du ledger)
      const newBalance = await this.recalculateBalance(manager, id);
      await manager.update(Wallet, { id }, { balance: newBalance });

      return manager.findOneOrFail(Wallet, { where: { id } });
    });
  }

  async withdraw(id: string, userId: number, dto: WithdrawDto): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await this.pinService.verifyPinWithManager(manager, id, userId, dto.pin);
      this.walletsService.assertActive(wallet);
      this.assertNotTontine(wallet);

      const amount = BigInt(dto.amount);
      if (wallet.balance < amount) {
        throw new BadRequestException('Solde insuffisant');
      }

      // Écriture comptable immutable
      const entry = manager.create(WalletTransaction, {
        walletId: id,
        type: WalletTransactionType.WITHDRAWAL,
        amount,
        description: dto.description ?? 'Retrait',
      });
      await manager.save(entry);

      // Recalcul du solde (projection du ledger)
      const newBalance = await this.recalculateBalance(manager, id);
      await manager.update(Wallet, { id }, { balance: newBalance });

      return manager.findOneOrFail(Wallet, { where: { id } });
    });
  }

  async transfer(
    fromId: string,
    userId: number,
    dto: TransferDto,
  ): Promise<{ from: Wallet; to: Wallet }> {
    if (fromId === dto.toWalletId) {
      throw new BadRequestException('Impossible de transférer vers le même wallet');
    }

    return this.dataSource.transaction(async (manager) => {
      // Verrouillage dans l'ordre des IDs pour éviter les deadlocks
      const [firstId, secondId] = [fromId, dto.toWalletId].sort();
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

      const toWallet = await this.walletsService.lockWalletForUpdate(manager, dto.toWalletId);
      this.walletsService.assertActive(toWallet);
      this.assertNotTontine(toWallet);

      if (fromWallet.currency !== toWallet.currency) {
        throw new BadRequestException(
          'Transfert entre devises différentes non supporté pour le moment',
        );
      }

      const amount = BigInt(dto.amount);
      if (fromWallet.balance < amount) {
        throw new BadRequestException('Solde insuffisant');
      }

      // Écritures comptables immuables (paire débit/crédit)
      const outEntry = manager.create(WalletTransaction, {
        walletId: fromId,
        type: WalletTransactionType.TRANSFER_OUT,
        amount,
        relatedWalletId: dto.toWalletId,
        description: dto.description ?? `Transfert vers ${dto.toWalletId}`,
      });
      const inEntry = manager.create(WalletTransaction, {
        walletId: dto.toWalletId,
        type: WalletTransactionType.TRANSFER_IN,
        amount,
        relatedWalletId: fromId,
        description: dto.description ?? `Transfert depuis ${fromId}`,
      });
      await manager.save([outEntry, inEntry]);

      // Recalcul des soldes (projections du ledger)
      const [newFromBalance, newToBalance] = await Promise.all([
        this.recalculateBalance(manager, fromId),
        this.recalculateBalance(manager, dto.toWalletId),
      ]);
      await manager.update(Wallet, { id: fromId }, { balance: newFromBalance });
      await manager.update(Wallet, { id: dto.toWalletId }, { balance: newToBalance });

      const [updatedFrom, updatedTo] = await Promise.all([
        manager.findOneOrFail(Wallet, { where: { id: fromWallet.id } }),
        manager.findOneOrFail(Wallet, { where: { id: toWallet.id } }),
      ]);

      return { from: updatedFrom, to: updatedTo };
    });
  }

  /**
   * Enregistre un paiement externe (Tranzak) dans le ledger.
   * Crée une écriture comptable avec statut PENDING.
   */
  async recordExternalPayment(
    data: {
      walletId: string;
      amount: bigint;
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

      // Idempotence : si déjà COMPLETED, on ne fait rien
      if (transaction.status === WalletTransactionStatus.COMPLETED) {
        return transaction;
      }

      // Mettre à jour le providerTransactionId si on a reçu le callback avec le requestId
      if (isRequestId && !transaction.providerTransactionId) {
        // On ne peut pas updater ici sans le transactionId, mais on le fera via le callback
      }

      transaction.status = newStatus;
      await manager.save(transaction);

      // Recalcul du solde du wallet
      const newBalance = await this.recalculateBalance(manager, transaction.walletId);
      await manager.update(Wallet, { id: transaction.walletId }, { balance: newBalance });

      return transaction;
    });
  }

  /**
   * Recalcule le solde d'un wallet en sommant les écritures du ledger.
   * deposits + transfer_in - withdrawals - transfer_out
   */
  async listByWallet(walletId: string): Promise<WalletTransaction[]> {
    return this.dataSource
      .getRepository(WalletTransaction)
      .createQueryBuilder('wt')
      .where('wt.walletId = :walletId', { walletId })
      .orderBy('wt.createdAt', 'DESC')
      .getMany();
  }

  private async recalculateBalance(manager: EntityManager, walletId: string): Promise<bigint> {
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
      .andWhere('wt.status = :status', { status: WalletTransactionStatus.COMPLETED })
      .getRawOne<{ balance: string }>();

    return BigInt(result?.balance ?? '0');
  }

  private assertNotTontine(wallet: Wallet): void {
    if (wallet.type === WalletType.TONTINE) {
      throw new BadRequestException(
        'Les opérations sur un portefeuille tontine passent par le module tontine.',
      );
    }
  }
}
