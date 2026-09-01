import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TontineCycle } from '../entities/tontine-cycle.entity';
import { TontineMember } from '../entities/tontine-member.entity';
import { Tontine } from '../entities/tontine.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionType,
} from '../../transactions/entities/wallet-transaction.entity';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';
import { recalculateBalance } from '../utils/balance.util';

@Injectable()
export class PayoutService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async processPayout(cycleId: string): Promise<{ beneficiaryWallet: Wallet; amount: string }> {
    return this.dataSource.transaction(async (manager) => {
      const cycle = await manager.findOneOrFail(TontineCycle, {
        where: { id: cycleId },
        relations: ['contributions'],
      });

      if (cycle.status !== TontineCycleStatus.COMPLETED) {
        throw new BadRequestException('Le cycle doit être terminé pour verser le pot');
      }

      const allPaid = cycle.contributions.every((c) => c.status === TontineContributionStatus.PAID);
      if (!allPaid) {
        throw new BadRequestException('Toutes les contributions doivent être payées');
      }

      const tontine = await manager.findOneOrFail(Tontine, {
        where: { id: cycle.tontineId },
      });

      const beneficiary = await manager.findOneOrFail(TontineMember, {
        where: { id: cycle.beneficiaryId },
      });

      const beneficiaryWallet = await manager.findOne(Wallet, {
        where: { userId: beneficiary.userId, isPrimary: true },
      });

      if (!beneficiaryWallet) {
        throw new BadRequestException(
          "Le bénéficiaire n'a pas de wallet actif pour recevoir le pot",
        );
      }

      const tontineWallet = await manager.findOneOrFail(Wallet, {
        where: { walletNumber: tontine.walletNumber },
      });

      const amount = Number(cycle.collectedAmount);

      if (Number(tontineWallet.balance) < amount) {
        throw new BadRequestException('Solde wallet tontine insuffisant');
      }

      const debitEntry = manager.create(WalletTransaction, {
        walletId: tontineWallet.id,
        type: WalletTransactionType.TRANSFER_OUT,
        amount,
        relatedWalletId: beneficiaryWallet.id,
        description: `Pot tontine cycle ${cycle.cycleNumber} - Versement bénéficiaire`,
      });
      await manager.save(debitEntry);

      const creditEntry = manager.create(WalletTransaction, {
        walletId: beneficiaryWallet.id,
        type: WalletTransactionType.TRANSFER_IN,
        amount,
        relatedWalletId: tontineWallet.id,
        description: `Réception pot tontine cycle ${cycle.cycleNumber}`,
      });
      await manager.save(creditEntry);

      const [newTontineBalance, newBeneficiaryBalance] = await Promise.all([
        recalculateBalance(manager, tontineWallet.id),
        recalculateBalance(manager, beneficiaryWallet.id),
      ]);
      await manager.update(Wallet, { id: tontineWallet.id }, { balance: newTontineBalance });
      await manager.update(
        Wallet,
        { id: beneficiaryWallet.id },
        { balance: newBeneficiaryBalance },
      );

      cycle.status = TontineCycleStatus.COMPLETED;
      cycle.completedAt = new Date();
      await manager.save(cycle);

      beneficiary.hasReceivedPayout = true;
      await manager.save(beneficiary);

      return {
        beneficiaryWallet: await manager.findOneOrFail(Wallet, {
          where: { id: beneficiaryWallet.id },
        }),
        amount: cycle.collectedAmount,
      };
    });
  }

}
