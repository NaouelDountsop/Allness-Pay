import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { TontineContribution } from '../entities/tontine-contribution.entity';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';

@Injectable()
export class ContributionReminderJob {
  private readonly logger = new Logger(ContributionReminderJob.name);

  constructor(
    @InjectRepository(TontineContribution)
    private readonly contributionRepo: Repository<TontineContribution>,
  ) {}

  async handle(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const pendingContributions = await this.contributionRepo.find({
      where: {
        status: TontineContributionStatus.PENDING,
        dueDate: LessThanOrEqual(threeDaysFromNow),
      },
      relations: ['cycle', 'cycle.tontine'],
    });

    this.logger.log(
      `${pendingContributions.length} contributions à rappeler`,
    );

    for (const contribution of pendingContributions) {
      this.logger.log(
        `Rappel: contribution ${contribution.id} due le ${contribution.dueDate.toISOString()}`,
      );
      // TODO: Intégrer avec le MailModule pour envoyer un email de rappel
    }
  }
}
