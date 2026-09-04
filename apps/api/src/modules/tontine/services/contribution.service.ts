import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
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
import { TontineMemberStatus } from '../enums/tontine-member-status.enum';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import { recalculateBalance } from '../utils/balance.util';

@Injectable()
export class ContributionService {
  constructor(
    @InjectRepository(TontineContribution)
    private readonly contributionRepo: Repository<TontineContribution>,
    @InjectRepository(TontineCycle)
    private readonly cycleRepo: Repository<TontineCycle>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
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

      const expectedAmount = Number(cycle.totalPot) / cycle.contributions.length;
      const providedAmount = Number(dto.amount);
      if (providedAmount < expectedAmount) {
        throw new BadRequestException(`Montant insuffisant. Attendu: ${expectedAmount}`);
      }

      const memberWallet = await this.walletsService.lockWalletForUpdate(manager, dto.walletId);
      this.walletsService.assertOwnership(memberWallet, member.userId);
      this.walletsService.assertActive(memberWallet);

      if (Number(memberWallet.balance) < providedAmount) {
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
        recalculateBalance(manager, dto.walletId),
        recalculateBalance(manager, tontineWallet.id),
      ]);
      await manager.update(Wallet, { id: dto.walletId }, { balance: newMemberBalance });
      await manager.update(Wallet, { id: tontineWallet.id }, { balance: newTontineBalance });

      contribution.status = TontineContributionStatus.PAID;
      contribution.paidAt = new Date();
      contribution.walletTransactionId = debitEntry.id;
      await manager.save(contribution);

      const paidAmount = Number(cycle.collectedAmount) + providedAmount;
      cycle.collectedAmount = paidAmount.toString();
      await manager.save(cycle);

      return contribution;
    });
  }

  async findAllByCycle(cycleId: string): Promise<TontineContribution[]> {
    return this.contributionRepo.find({
      where: { cycleId },
      relations: ['member', 'member.user', 'cycle'],
    });
  }

  async findPendingByMember(memberId: string): Promise<TontineContribution[]> {
    return this.contributionRepo.find({
      where: {
        memberId,
        status: TontineContributionStatus.PENDING,
      },
      relations: ['member', 'member.user', 'cycle'],
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

  async findAllCycles(tontineId: string, userId: number): Promise<TontineCycle[]> {
    const member = await this.memberRepo.findOne({
      where: { tontineId, userId, status: TontineMemberStatus.ACTIVE },
    });
    if (!member) {
      throw new NotFoundException("Vous n'êtes pas membre de cette tontine");
    }

    return this.cycleRepo.find({
      where: { tontineId },
      order: { cycleNumber: 'DESC' },
      relations: ['contributions'],
    });
  }

  async checkMyContributionStatus(
    tontineId: string,
    userId: number,
  ): Promise<{ hasPaid: boolean; cycleNumber: number; amount: string; currency: string }> {
    const member = await this.memberRepo.findOne({
      where: { tontineId, userId, status: TontineMemberStatus.ACTIVE },
    });
    if (!member) {
      throw new NotFoundException("Vous n'êtes pas membre de cette tontine");
    }

    const activeCycle = await this.cycleRepo.findOne({
      where: { tontineId, status: TontineCycleStatus.ACTIVE },
      relations: ['contributions'],
    });
    if (!activeCycle) {
      return { hasPaid: false, cycleNumber: 0, amount: '0', currency: 'XAF' };
    }

    const contribution = activeCycle.contributions.find((c) => c.memberId === member.id);
    const tontine = await this.dataSource.getRepository(Tontine).findOne({
      where: { id: tontineId },
      select: ['currency'],
    });

    return {
      hasPaid: contribution?.status === TontineContributionStatus.PAID,
      cycleNumber: activeCycle.cycleNumber,
      amount: contribution?.amount ?? '0',
      currency: tontine?.currency ?? 'XAF',
    };
  }

  async findAllByTontine(
    tontineId: string,
    userId: number,
    cycleId?: string,
  ): Promise<TontineContribution[]> {
    const member = await this.memberRepo.findOne({
      where: { tontineId, userId, status: TontineMemberStatus.ACTIVE },
    });
    if (!member) {
      return [];
    }

    const cycles = await this.cycleRepo.find({
      where: { tontineId },
      select: ['id'],
    });
    const cycleIds = cycles.map((c) => c.id);

    if (cycleIds.length === 0) return [];

    return this.contributionRepo.find({
      where: {
        cycleId: cycleId ? cycleId : In(cycleIds),
      },
      relations: ['member', 'member.user', 'cycle'],
      order: { dueDate: 'ASC' },
    });
  }

  async exportByTontine(tontineId: string): Promise<Buffer> {
    const cycles = await this.cycleRepo.find({
      where: { tontineId },
      order: { cycleNumber: 'ASC' },
    });

    if (cycles.length === 0) {
      throw new NotFoundException('Aucun cycle trouvé pour cette tontine');
    }

    const contributions = await this.contributionRepo.find({
      where: { cycleId: In(cycles.map((c) => c.id)) },
      relations: ['member', 'member.user', 'cycle'],
    });

    const STATUS_COLORS: Record<string, string> = {
      PAID: 'FF10B981',
      PENDING: 'FFF59E0B',
      LATE: 'FFEF4444',
      FAILED: 'FF9CA3AF',
    };

    const STATUS_LABELS: Record<string, string> = {
      PAID: 'Validé',
      PENDING: 'En attente',
      LATE: 'En retard',
      FAILED: 'Échoué',
    };

    const memberMap = new Map<
      string,
      { memberName: string; cycles: Record<string, { amount: number; status: string }>; total: number }
    >();

    for (const c of contributions) {
      const key = c.memberId;
      if (!memberMap.has(key)) {
        const memberName = c.member?.user
          ? `${c.member.user.prenom ?? ''} ${c.member.user.nom ?? ''}`.trim()
          : `Membre ${c.memberId}`;
        memberMap.set(key, { memberName, cycles: {}, total: 0 });
      }
      const entry = memberMap.get(key)!;
      entry.cycles[c.cycleId] = { amount: Number(c.amount), status: c.status };
      entry.total += Number(c.amount);
    }

    const sortedMembers = Array.from(memberMap.entries())
      .sort((a, b) => a[1].memberName.localeCompare(b[1].memberName));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AfriLinkPay';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Versements', {
      views: [{ state: 'frozen', ySplit: 2, xSplit: 1 }],
    });

    const cycleCount = cycles.length;

    const headerRow1 = sheet.getRow(1);
    const headerRow2 = sheet.getRow(2);

    headerRow1.getCell(1).value = 'Nom et prénom';
    sheet.mergeCells(1, 1, 2, 1);
    headerRow1.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

    cycles.forEach((cycle, i) => {
      const colStart = 2 + i * 2;
      const colEnd = colStart + 1;

      headerRow1.getCell(colStart).value = `Tour ${cycle.cycleNumber}`;
      sheet.mergeCells(1, colStart, 1, colEnd);
      headerRow1.getCell(colStart).alignment = { vertical: 'middle', horizontal: 'center' };

      headerRow2.getCell(colStart).value = 'Montant';
      headerRow2.getCell(colEnd).value = 'Statut';
    });

    const totalCol = 1 + cycleCount * 2 + 1;
    headerRow1.getCell(totalCol).value = 'TOTAL';
    sheet.mergeCells(1, totalCol, 2, totalCol);
    headerRow1.getCell(totalCol).alignment = { vertical: 'middle', horizontal: 'center' };

    [headerRow1, headerRow2].forEach((row) => {
      row.height = 22;
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F2A2E' },
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FF0F2A2E' } },
          right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        };
      });
    });

    sheet.getColumn(1).width = 28;
    cycles.forEach((_, i) => {
      sheet.getColumn(2 + i * 2).width = 14;
      sheet.getColumn(3 + i * 2).width = 14;
    });
    sheet.getColumn(totalCol).width = 16;

    sortedMembers.forEach(([_memberId, memberData], rowIdx) => {
      const rowNum = rowIdx + 3;
      const row = sheet.getRow(rowNum);

      row.getCell(1).value = memberData.memberName;
      row.getCell(1).alignment = { vertical: 'middle' };

      cycles.forEach((cycle, i) => {
        const contribution = memberData.cycles[cycle.id];
        const amountCol = 2 + i * 2;
        const statusCol = 3 + i * 2;

        row.getCell(amountCol).value = contribution?.amount ?? 0;
        row.getCell(amountCol).numFmt = '#,##0';
        row.getCell(amountCol).alignment = { vertical: 'middle', horizontal: 'right' };

        const statusValue = contribution?.status ?? '';
        row.getCell(statusCol).value = STATUS_LABELS[statusValue] ?? 'Non versé';
        const color = STATUS_COLORS[statusValue];
        if (color) {
          row.getCell(statusCol).font = { color: { argb: color }, bold: true };
        }
        row.getCell(statusCol).alignment = { vertical: 'middle', horizontal: 'center' };
      });

      row.getCell(totalCol).value = memberData.total;
      row.getCell(totalCol).numFmt = '#,##0';
      row.getCell(totalCol).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(totalCol).font = { bold: true };

      const isEven = rowIdx % 2 === 0;
      row.eachCell((cell, colNumber) => {
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        if (!isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        }
        if (colNumber > 1) {
          cell.border = {
            ...cell.border,
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };
        }
      });
      row.height = 20;
    });

    sheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: totalCol },
    };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }
}
