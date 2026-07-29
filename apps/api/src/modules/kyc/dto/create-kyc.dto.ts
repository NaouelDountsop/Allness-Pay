import { IsEnum, IsNotEmpty } from 'class-validator';
import { IdentityDocumentType, ProofOfAddressType } from '../entities/kyc.entity';

export class CreateKycDto {
  @IsEnum(IdentityDocumentType)
  @IsNotEmpty()
  IdentityDocumentType: IdentityDocumentType;

  @IsEnum(ProofOfAddressType)
  @IsNotEmpty()
  proofOfAddressType: ProofOfAddressType;
}