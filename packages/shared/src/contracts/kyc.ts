import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────────────────────

export const KycStatusEnum = z.enum([
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'REQUIRES_ADDITIONAL_INFO',
]);
export type KycStatus = z.infer<typeof KycStatusEnum>;

export const IdentityDocumentTypeEnum = z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE']);
export type IdentityDocumentType = z.infer<typeof IdentityDocumentTypeEnum>;

export const ProofOfAddressTypeEnum = z.enum([
  'UTILITY_BILL',
  'BANK_STATEMENT',
  'RESIDENCE_CERTIFICATE',
]);
export type ProofOfAddressType = z.infer<typeof ProofOfAddressTypeEnum>;

export const KycReviewStatusEnum = z.enum([
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'REQUIRES_ADDITIONAL_INFO',
]);
export type KycReviewStatus = z.infer<typeof KycReviewStatusEnum>;

// ── DTOs (validation) ──────────────────────────────────────────────────

export const CreateKycSchema = z.object({
  IdentityDocumentType: IdentityDocumentTypeEnum,
  proofOfAddressType: ProofOfAddressTypeEnum,
});
export type CreateKycDto = z.infer<typeof CreateKycSchema>;

export const ReviewKycSchema = z.object({
  status: KycReviewStatusEnum,
  reviewComment: z.string().optional(),
});
export type ReviewKycDto = z.infer<typeof ReviewKycSchema>;

// ── API response types ─────────────────────────────────────────────────

export interface KycRecord {
  id: number;
  userId: number;
  IdentityDocumentType: IdentityDocumentType;
  proofOfAddressType: ProofOfAddressType;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  proofOfAddressUrl: string;
  status: KycStatus;
  reviewComment?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycReviewResult {
  status: KycStatus;
  reviewComment?: string;
}
