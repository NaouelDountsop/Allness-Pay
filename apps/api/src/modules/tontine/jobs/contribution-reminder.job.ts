import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { TontineCycle } from '../entities/tontine-cycle.entity';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';

@Injectable()
export class ContributionReminderJob {
  private readonly logger = new Logger(ContributionReminderJob.name);

  constructor(
    @InjectRepository(TontineCycle)
    private readonly cycleRepo: Repository<TontineCycle>,
  ) {}

  async handle(): Promise<void> {
    const upcomingCycles = await this.cycleRepo.find({
      where: {
        status: TontineCycleStatus.PENDING,
        dueDate: LessThanOrEqual(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
      },
      relations: ['contributions'],
    });

    this.logger.log(
      `${upcomingCycles.length} cycles avec échéance proche`,
    );

    for (const cycle of upcomingCycles) {
      const pendingContributions = cycle.contributions.filter(
        (c) => c.status === TontineContributionStatus.PENDING,
      );

      this.logger.log(
        `Cycle ${cycle.id}: ${pendingContributions.length} contributions en attente`,
      );
    }
  }
}
