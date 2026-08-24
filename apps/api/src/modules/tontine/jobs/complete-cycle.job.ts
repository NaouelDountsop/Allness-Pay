import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TontineCycle } from '../entities/tontine-cycle.entity';
import { CycleService } from '../services/cycle.service';
import { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';

@Injectable()
export class CompleteCycleJob {
  private readonly logger = new Logger(CompleteCycleJob.name);

  constructor(
    @InjectRepository(TontineCycle)
    private readonly cycleRepo: Repository<TontineCycle>,
    private readonly cycleService: CycleService,
  ) {}

  async handle(): Promise<void> {
    const now = new Date();

    const activeCycles = await this.cycleRepo.find({
      where: {
        status: TontineCycleStatus.ACTIVE,
        dueDate: LessThan(now),
      },
    });

    this.logger.log(`${activeCycles.length} cycles actifs expirés à traiter`);

    let succeeded = 0;
    let failed = 0;

    for (const cycle of activeCycles) {
      try {
        await this.cycleService.completeCycle(cycle.id);
        succeeded++;
        this.logger.log(`Cycle ${cycle.id} (tontine ${cycle.tontineId}) terminé`);
      } catch (err) {
        failed++;
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(
          `Échec complétion cycle ${cycle.id}: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log(`Job terminé: ${succeeded} cycles complétés, ${failed} échecs`);
  }
}
