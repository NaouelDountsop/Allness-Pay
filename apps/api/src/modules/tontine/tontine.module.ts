import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tontine } from './entities/tontine.entity';
import { TontineMember } from './entities/tontine-member.entity';
import { TontineCycle } from './entities/tontine-cycle.entity';
import { TontineContribution } from './entities/tontine-contribution.entity';
import { TontineInvitation } from './entities/tontine-invitation.entity';
import { WalletTransaction } from '../transactions/entities/wallet-transaction.entity';
import { TontineController } from './tontine.controller';
import { TontineService } from './services/tontine.service';
import { CycleService } from './services/cycle.service';
import { ContributionService } from './services/contribution.service';
import { PayoutService } from './services/payout.service';
import { InvitationService } from './services/invitation.service';
import { GenerateCycleJob } from './jobs/generate-cycle.job';
import { ContributionReminderJob } from './jobs/contribution-reminder.job';
import { LatePenaltyJob } from './jobs/late-penalty.job';
import { PayoutJob } from './jobs/payout.job';
import { WalletsModule } from '../wallet/wallet.module';
import { PinModule } from '../pin/pin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tontine,
      TontineMember,
      TontineCycle,
      TontineContribution,
      TontineInvitation,
      WalletTransaction,
    ]),
    WalletsModule,
    PinModule,
  ],
  controllers: [TontineController],
  providers: [
    TontineService,
    CycleService,
    ContributionService,
    PayoutService,
    InvitationService,
    GenerateCycleJob,
    ContributionReminderJob,
    LatePenaltyJob,
    PayoutJob,
  ],
  exports: [TontineService, CycleService, ContributionService],
})
export class TontineModule {}
