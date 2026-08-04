import type{ TontineStatus } from '../enums/tontine-status.enum';
import type { TontineFrequency } from '../enums/tontine-frequency.enum';
import type { TontineMemberRole,TontineMemberStatus } from '../entities/tontine-member.entity';
import type{ TontineCycleStatus } from '../enums/tontine-cycle-status.enum';
import type { TontineContributionStatus } from '../enums/tontine-contribution-status.enum';


export interface TontineMemberSummary {
  id: number;
  userId: number;
  role: TontineMemberRole;
  status: TontineMemberStatus;
  tourOrdre: number;
  aPayeTourActuel: boolean;
  beneficiaryOrder?: number;
  hasReceivedPayout: boolean;
  missedContributions: number;
}

export interface TontineCycleSummary {
  id: number;
  cycleNumber: number;
  beneficiaryId: number;
  status: TontineCycleStatus;
  totalPot: string;
  collectedAmount: string;
  dueDate: Date;
  completedAt?: Date;
}

export interface TontineContributionSummary {
  id: number;
  cycleId: number;
  memberId: number;
  amount: string;
  status: TontineContributionStatus;
  paidAt?: Date;
  dueDate: Date;
  penaltyCount: number;
}

export interface TontineSummary {
  id: number;
  name: string;
  description?: string;
  montantCotisation: string;
  frequence: TontineFrequency;
  nombreMembres: number;
  statut: TontineStatus;
  tourActuel: number;
  devise: string;
  lieu?: string;
  createurId: number;
  createdAt: Date;
  membres: TontineMemberSummary[];
}
