import { IsEnum, IsOptional, IsString } from 'class-validator';
import { KycStatus } from '../entities/kyc.entity';

export class ReviewKycDto {
  @IsEnum(KycStatus)
  status: KycStatus.APPROVED | KycStatus.REJECTED;

  @IsString()
  @IsOptional()
  reviewComment?: string;
}