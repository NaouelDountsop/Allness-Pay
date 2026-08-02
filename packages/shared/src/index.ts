/**
 * @afrilinkpay/shared
 *
 * Source de verite des contrats echanges entre l'API et le front-end :
 * enumerations, types de DTO et utilitaires communs.
 *
 * Toute modification ici est une modification de contrat : elle impacte les
 * deux applications et doit etre versionnee comme telle.
 */

export {
  KycStatusEnum,
  IdentityDocumentTypeEnum,
  ProofOfAddressTypeEnum,
  KycReviewStatusEnum,
  CreateKycSchema,
  ReviewKycSchema,
} from './contracts/kyc';

export type {
  KycStatus,
  IdentityDocumentType,
  ProofOfAddressType,
  KycReviewStatus,
  CreateKycDto,
  ReviewKycDto,
  KycRecord,
  KycReviewResult,
} from './contracts/kyc';
