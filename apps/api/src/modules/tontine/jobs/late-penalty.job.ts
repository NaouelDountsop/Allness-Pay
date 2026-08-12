import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TontineContribution } from '../entities/tontine-contribution.entity';
import { TontineMember } from '../entities/tontine-member.entity';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';
import { TontineMemberStatus } from '../enums/tontine-member-status.enum';

const MAX_MISSED_CONTRIBUTIONS = 3;

@Injectable()
export class LatePenaltyJob {
  private readonly logger = new Logger(LatePenaltyJob.name);

  constructor(
    @InjectRepository(TontineContribution)
    private readonly contributionRepo: Repository<TontineContribution>,
    @InjectRepository(TontineMember)
    private readonly memberRepo: Repository<TontineMember>,
  ) {}

  async handle(): Promise<void> {
    const now = new Date();

    const overdueContributions = await this.contributionRepo.find({
      where: {
        status: TontineContributionStatus.PENDING,
        dueDate: LessThan(now),
      },
      relations: ['cycle'],
    });

    this.logger.log(`${overdueContributions.length} contributions en retard détectées`);

    for (const contribution of overdueContributions) {
      contribution.status = TontineContributionStatus.LATE;
      contribution.penaltyCount += 1;
      await this.contributionRepo.save(contribution);

      const member = await this.memberRepo.findOne({
        where: { id: contribution.memberId },
      });

      if (member) {
        member.missedContributions += 1;

        if (member.missedContributions >= MAX_MISSED_CONTRIBUTIONS) {
          member.status = TontineMemberStatus.SUSPENDED;
          this.logger.warn(
            `Membre ${member.id} suspendu après ${member.missedContributions} contributions manquées`,
          );
        }

        await this.memberRepo.save(member);
      }
    }
  }
}
