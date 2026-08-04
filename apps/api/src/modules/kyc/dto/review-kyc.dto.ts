import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum KycReviewStatus {
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUIRES_ADDITIONAL_INFO = 'REQUIRES_ADDITIONAL_INFO',
}

export class ReviewKycDto {
  @IsEnum(KycReviewStatus)
  status: KycReviewStatus;

  @IsString()
  @IsOptional()
  reviewComment?: string;
}
