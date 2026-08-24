import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tontine } from './entities/tontine.entity';
import { TontineMember } from './entities/tontine-member.entity';
import { TontineCycle } from './entities/tontine-cycle.entity';
import { TontineContribution } from './entities/tontine-contribution.entity';
import { TontineInvitation } from './entities/tontine-invitation.entity';
import { TontineController } from './tontine.controller';
import { TontineInvitationController } from './tontine-invitation.controller';
import { TontineService } from './tontine.service';
import { CycleService } from './services/cycle.service';
import { ContributionService } from './services/contribution.service';
import { InvitationService } from './services/invitation.service';
import { PayoutService } from './services/payout.service';
import { GenerateCycleJob } from './jobs/generate-cycle.job';
import { LatePenaltyJob } from './jobs/late-penalty.job';
import { PayoutJob } from './jobs/payout.job';
import { ContributionReminderJob } from './jobs/contribution-reminder.job';
import { CompleteCycleJob } from './jobs/complete-cycle.job';
import { WalletsModule } from '../wallet/wallet.module';
import { MessagingModule } from '../messaging/messaging.module';
import { Wallet } from '../wallet/entities/wallet.entity';
import { PinModule } from '../pin/pin.module';
import { MailModule } from '../mail/mail.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tontine,
      TontineMember,
      TontineCycle,
      TontineContribution,
      TontineInvitation,
      Wallet,
      User,
    ]),
    WalletsModule,
    PinModule,
    MailModule,
    MessagingModule,
  ],
  controllers: [TontineController, TontineInvitationController],
  providers: [
    TontineService,
    CycleService,
    ContributionService,
    InvitationService,
    PayoutService,
    GenerateCycleJob,
    LatePenaltyJob,
    PayoutJob,
    ContributionReminderJob,
    CompleteCycleJob,
  ],
  exports: [TontineService, CycleService, ContributionService, InvitationService, PayoutService],
})
export class TontineModule {}
