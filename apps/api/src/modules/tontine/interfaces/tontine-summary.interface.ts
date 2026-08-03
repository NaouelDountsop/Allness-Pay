import { TontineStatus } from '../enums/tontine-status.enum';
import { TontineFrequency } from '../enums/tontine-frequency.enum';

export interface TontineMemberSummary {
  id: string;
  userId: number;
  role: string;
  status: string;
  beneficiaryOrder?: number;
  hasReceivedPayout: boolean;
}

export interface TontineCycleSummary {
  id: string;
  cycleNumber: number;
  beneficiaryId: string;
  status: string;
  totalPot: string;
  collectedAmount: string;
  dueDate: Date;
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
  nextContributionAt?: Date;
  creatorId: number;
  walletId: string;
  createdAt: Date;
  memberCount: number;
  members: TontineMemberSummary[];
  currentCycleSummary?: TontineCycleSummary;
}
