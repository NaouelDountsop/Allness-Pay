import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Tontine } from '../entities/tontine.entity';
import { CycleService } from '../services/cycle.service';
import { TontineStatus } from '../enums/tontine-status.enum';

@Injectable()
export class GenerateCycleJob {
  private readonly logger = new Logger(GenerateCycleJob.name);

  constructor(
    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
    private readonly cycleService: CycleService,
  ) {}

  async handle(): Promise<void> {
    const tontines = await this.tontineRepo.find({
      where: {
        status: TontineStatus.ACTIVE,
        nextContributionAt: LessThanOrEqual(new Date()),
      },
    });

    this.logger.log(`${tontines.length} tontines à traiter pour génération de cycle`);

    for (const tontine of tontines) {
      try {
        await this.cycleService.generateNextCycle(tontine.id);
        this.logger.log(`Cycle généré pour tontine ${tontine.id}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Erreur génération cycle tontine ${tontine.id}: ${message}`,
        );
      }
    }
  }
}
