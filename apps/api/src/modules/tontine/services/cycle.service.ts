import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tontine, TontineStatus } from '../entities/tontine.entity';
import { TontineCycle } from '../entities/tontine-cycle.entity';
import { TontineMember, TontineMemberStatus } from '../entities/tontine-member.entity';
import { TontineContribution } from '../entities/tontine-contribution.entity';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';

@Injectable()
export class CycleService {
  constructor(
    @InjectRepository(TontineCycle)
    private readonly cycleRepo: Repository<TontineCycle>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async generateNextCycle(tontineId: string): Promise<TontineCycle> {
    return this.dataSource.transaction(async (manager) => {
      const tontine = await manager.findOneOrFail(Tontine, {
        where: { id: tontineId },
      });

      if (tontine.status !== TontineStatus.ACTIVE) {
        throw new BadRequestException('La tontine doit être ACTIVE pour générer un cycle');
      }

      const members = await manager.find(TontineMember, {
        where: { tontineId, status: TontineMemberStatus.ACTIVE },
      });

      if (members.length < 2) {
        throw new BadRequestException('Pas assez de membres actifs pour un cycle');
      }

      const nextCycleNumber = tontine.currentCycle + 1;

      const beneficiary = this.selectBeneficiary(members, nextCycleNumber);
      if (!beneficiary) {
        throw new BadRequestException('Aucun bénéficiaire disponible');
      }

      const totalPot = BigInt(tontine.contributionAmount) * BigInt(members.length);

      const dueDate = this.calculateDueDate(tontine.frequency, nextCycleNumber);

      const cycle = manager.create(TontineCycle, {
        tontineId,
        cycleNumber: nextCycleNumber,
        beneficiaryId: beneficiary.id,
        status: TontineCycleStatus.PENDING,
        totalPot: totalPot.toString(),
        collectedAmount: '0',
        dueDate,
      });
      const savedCycle = await manager.save(cycle);

      const contributions = members.map((member) =>
        manager.create(TontineContribution, {
          cycleId: savedCycle.id,
          memberId: member.id,
          amount: tontine.contributionAmount.toString(),
          status: TontineContributionStatus.PENDING,
          dueDate,
        }),
      );
      await manager.save(contributions);

      tontine.currentCycle = nextCycleNumber;
      await manager.save(tontine);

      return savedCycle;
    });
  }

  async findAllByTontine(tontineId: string): Promise<TontineCycle[]> {
    return this.cycleRepo.find({
      where: { tontineId },
      order: { cycleNumber: 'DESC' },
      relations: ['contributions'],
    });
  }

  async findOne(id: string): Promise<TontineCycle> {
    const cycle = await this.cycleRepo.findOne({
      where: { id },
      relations: ['contributions'],
    });
    if (!cycle) {
      throw new NotFoundException(`Cycle ${id} introuvable`);
    }
    return cycle;
  }

  async completeCycle(cycleId: string): Promise<TontineCycle> {
    const cycle = await this.findOne(cycleId);

    if (cycle.status !== TontineCycleStatus.ACTIVE) {
      throw new BadRequestException('Seul un cycle ACTIVE peut être complété');
    }

    const allPaid = cycle.contributions.every(
      (c) => c.status === TontineContributionStatus.PAID,
    );

    cycle.status = allPaid ? TontineCycleStatus.COMPLETED : TontineCycleStatus.FAILED;
    cycle.completedAt = new Date();

    if (allPaid) {
      await this.memberRepo.update(cycle.beneficiaryId, { hasReceivedPayout: true });
    }

    return this.cycleRepo.save(cycle);
  }

  private selectBeneficiary(
    members: TontineMember[],
    cycleNumber: number,
  ): TontineMember | undefined {
    const eligible = members
      .filter((m) => !m.hasReceivedPayout)
      .sort((a, b) => (a.beneficiaryOrder ?? Infinity) - (b.beneficiaryOrder ?? Infinity));

    if (eligible.length === 0) {
      const shuffled = [...members].sort(() => Math.random() - 0.5);
      return shuffled[0];
    }

    return eligible[(cycleNumber - 1) % eligible.length];
  }

  private calculateDueDate(frequency: string, cycleNumber: number): Date {
    const now = new Date();
    const offset = cycleNumber - 1;

    switch (frequency) {
      case 'WEEKLY':
        now.setDate(now.getDate() + offset * 7);
        break;
      case 'BIWEEKLY':
        now.setDate(now.getDate() + offset * 14);
        break;
      case 'MONTHLY':
      default:
        now.setMonth(now.getMonth() + offset);
        break;
    }

    return now;
  }
}
