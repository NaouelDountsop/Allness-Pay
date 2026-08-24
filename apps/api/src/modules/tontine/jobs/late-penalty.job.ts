import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { TontineContribution } from '../entities/tontine-contribution.entity';
import { TontineMember } from '../entities/tontine-member.entity';
import { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';

@Injectable()
export class LatePenaltyJob {
  private readonly logger = new Logger(LatePenaltyJob.name);

  constructor(
    @InjectRepository(TontineContribution)
    private readonly contributionRepo: Repository<TontineContribution>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async handle(): Promise<void> {
    const now = new Date();

    const overdueContributions = await this.contributionRepo.find({
      where: {
        status: TontineContributionStatus.PENDING,
        dueDate: LessThan(now),
      },
    });

    this.logger.log(`${overdueContributions.length} contributions en retard détectées`);

    let succeeded = 0;
    let failed = 0;

    for (const contribution of overdueContributions) {
      try {
        await this.dataSource.transaction(async (manager) => {
          contribution.status = TontineContributionStatus.LATE;
          contribution.penaltyCount += 1;
          await manager.save(contribution);

          const member = await manager.findOne(TontineMember, {
            where: { id: contribution.memberId },
          });

          if (member) {
            member.missedContributions += 1;
            await manager.save(member);
          } else {
            this.logger.warn(
              `Membre introuvable pour la contribution ${contribution.id} (memberId: ${contribution.memberId})`,
            );
          }
        });
        succeeded++;
      } catch (err) {
        failed++;
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(
          `Échec du traitement de la contribution ${contribution.id}: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log(`Job terminé: ${succeeded} traitées, ${failed} échecs`);
  }
}