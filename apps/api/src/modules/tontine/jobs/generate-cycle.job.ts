import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tontine, TontineStatus } from '../entities/tontine.entity';
import { CycleService } from '../services/cycle.service';

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
      },
    });

    this.logger.log(`${tontines.length} tontines actives à traiter pour génération de cycle`);

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
