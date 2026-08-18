import type { EntityManager } from 'typeorm';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TontineContribution } from '../entities/tontine-contribution.entity';
import { TontineCycle } from '../entities/tontine-cycle.entity';
import { TontineMember } from '../entities/tontine-member.entity';
import { Tontine } from '../entities/tontine.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionType,
} from '../../transactions/entities/wallet-transaction.entity';
import { WalletsService } from '../../wallet/wallet.service';
import { PinService } from '../../pin/pin.service';
import { ContributeDto } from '../dto/contribute.dto';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(TontineContribution)
    private readonly contributionRepo: Repository<TontineContribution>,
    private readonly walletsService: WalletsService,
    private readonly pinService: PinService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async contribute(memberId: string, dto: ContributeDto): Promise<TontineContribution> {
    return this.dataSource.transaction(async (manager) => {
      const member = await manager.findOneOrFail(TontineMember, {
        where: { id: memberId },
      });

      const tontine = await manager.findOneOrFail(Tontine, {
        where: { id: member.tontineId },
      });

      const cycle = await manager.findOneOrFail(TontineCycle, {
        where: { id: dto.cycleId },
        relations: ['contributions'],
      });

      if (cycle.status === TontineCycleStatus.COMPLETED) {
        throw new BadRequestException('Ce cycle est déjà terminé');
      }

      const contribution = cycle.contributions.find((c) => c.memberId === memberId);
      if (!contribution) {
        throw new NotFoundException('Contribution introuvable pour ce membre et ce cycle');
      }

      if (contribution.status === TontineContributionStatus.PAID) {
        throw new BadRequestException('Contribution déjà payée');
      }

      const expectedAmount = BigInt(cycle.totalPot) / BigInt(cycle.contributions.length);
      const providedAmount = BigInt(dto.amount);
      if (providedAmount < expectedAmount) {
        throw new BadRequestException(`Montant insuffisant. Attendu: ${expectedAmount.toString()}`);
      }

      const memberWallet = await this.walletsService.lockWalletForUpdate(manager, dto.walletId);
      this.walletsService.assertOwnership(memberWallet, member.userId);
      this.walletsService.assertActive(memberWallet);

      if (memberWallet.balance < providedAmount) {
        throw new BadRequestException('Solde wallet insuffisant');
      }

      await this.pinService.verifyPinWithManager(manager, dto.walletId, member.userId, dto.pin);

      const tontineWallet = await manager.findOneOrFail(Wallet, {
        where: { walletNumber: tontine.walletNumber },
      });

      const debitEntry = manager.create(WalletTransaction, {
        walletId: dto.walletId,
        type: WalletTransactionType.TRANSFER_OUT,
        amount: providedAmount,
        relatedWalletId: tontineWallet.id,
        description: `Contribution tontine cycle ${cycle.cycleNumber}`,
      });
      await manager.save(debitEntry);

      const creditEntry = manager.create(WalletTransaction, {
        walletId: tontineWallet.id,
        type: WalletTransactionType.TRANSFER_IN,
        amount: providedAmount,
        relatedWalletId: dto.walletId,
        description: `Cotisation membre cycle ${cycle.cycleNumber}`,
      });
      await manager.save(creditEntry);

      const [newMemberBalance, newTontineBalance] = await Promise.all([
        this.recalculateBalance(manager, dto.walletId),
        this.recalculateBalance(manager, tontineWallet.id),
      ]);
      await manager.update(Wallet, { id: dto.walletId }, { balance: newMemberBalance });
      await manager.update(Wallet, { id: tontineWallet.id }, { balance: newTontineBalance });

      contribution.status = TontineContributionStatus.PAID;
      contribution.paidAt = new Date();
      contribution.walletTransactionId = debitEntry.id;
      await manager.save(contribution);

      const paidAmount = BigInt(cycle.collectedAmount) + providedAmount;
      cycle.collectedAmount = paidAmount.toString();
      await manager.save(cycle);

      return contribution;
    });
  }

  async findAllByCycle(cycleId: string): Promise<TontineContribution[]> {
    return this.contributionRepo.find({
      where: { cycleId },
      relations: ['cycle'],
    });
  }

  async findPendingByMember(memberId: string): Promise<TontineContribution[]> {
    return this.contributionRepo.find({
      where: {
        memberId,
        status: TontineContributionStatus.PENDING,
      },
      relations: ['cycle'],
      order: { dueDate: 'ASC' },
    });
  }

  async findActiveCycle(tontineId: string): Promise<TontineCycle | null> {
    return this.dataSource.getRepository(TontineCycle).findOne({
      where: { tontineId, status: TontineCycleStatus.ACTIVE },
    });
  }

  async markLate(contributionId: string): Promise<TontineContribution> {
    const contribution = await this.contributionRepo.findOne({
      where: { id: contributionId },
    });
    if (!contribution) {
      throw new NotFoundException('Contribution introuvable');
    }

    if (contribution.status !== TontineContributionStatus.PENDING) {
      throw new BadRequestException('Seule une contribution PENDING peut être marquée en retard');
    }

    contribution.status = TontineContributionStatus.LATE;
    contribution.penaltyCount += 1;
    return this.contributionRepo.save(contribution);
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
      .getRawOne<{ balance: string }>();

    return BigInt(result?.balance ?? '0');
  }
}
