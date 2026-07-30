import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum KycReviewStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewKycDto {
  @IsEnum(KycReviewStatus)
  status: KycReviewStatus;

  @IsString()
  @IsOptional()
  reviewComment?: string;
}
