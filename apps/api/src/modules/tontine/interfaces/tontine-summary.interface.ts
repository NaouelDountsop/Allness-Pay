import type { TontineStatus } from '../enums/tontine-status.enum';
import type { TontineFrequency } from '../enums/tontine-frequency.enum';
import type { TontineMemberRole, TontineMemberStatus } from '../entities/tontine-member.entity';
import type { TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import type { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';

export interface TontineMemberSummary {
  id: string;
  userId: number;
  role: TontineMemberRole;
  status: TontineMemberStatus;
  beneficiaryOrder?: number;
  hasReceivedPayout: boolean;
  missedContributions: number;
}

export interface TontineCycleSummary {
  id: string;
  cycleNumber: number;
  beneficiaryId: string;
  status: TontineCycleStatus;
  totalPot: string;
  collectedAmount: string;
  dueDate: Date;
  completedAt?: Date;
}

export interface TontineContributionSummary {
  id: string;
  cycleId: string;
  memberId: string;
  amount: string;
  status: TontineContributionStatus;
  paidAt?: Date;
  dueDate: Date;
  penaltyCount: number;
}

export interface TontineSummary {
  id: string;
  name: string;
  description?: string;
  targetAmount: string;
  contributionAmount: string;
  memberLimit: number;
  currency: string;
  frequency: TontineFrequency;
  status: TontineStatus;
  currentCycle: number;
  creatorId: number;
  createdAt: Date;
  members: TontineMemberSummary[];
}
