import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TontineCycle } from '../entities/tontine-cycle.entity';
import { PayoutService } from '../services/payout.service';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';

@Injectable()
export class PayoutJob {
  private readonly logger = new Logger(PayoutJob.name);

  constructor(
    @InjectRepository(TontineCycle)
    private readonly cycleRepo: Repository<TontineCycle>,
    private readonly payoutService: PayoutService,
  ) {}

  async handle(): Promise<void> {
    const completedCycles = await this.cycleRepo.find({
      where: {
        status: TontineCycleStatus.COMPLETED,
      },
      relations: ['contributions'],
    });

    const readyForPayout = completedCycles.filter((cycle) =>
      cycle.contributions.every((c) => c.status === TontineContributionStatus.PAID),
    );

    this.logger.log(`${readyForPayout.length} cycles prêts pour versement`);

    for (const cycle of readyForPayout) {
      try {
        await this.payoutService.processPayout(cycle.id);
        this.logger.log(`Pot versé pour cycle ${cycle.id} (tontine ${cycle.tontineId})`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Erreur versement cycle ${cycle.id}: ${message}`);
      }
    }
  }
}
