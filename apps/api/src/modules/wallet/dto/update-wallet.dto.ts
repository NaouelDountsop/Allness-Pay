import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateWalletDto } from './create-wallet.dto';

// Le numéro de wallet et le statut ne se modifient pas via cette route
// (le statut passe par close(), un endpoint dédié et contrôlé).
export class UpdateWalletDto extends PartialType(
  OmitType(CreateWalletDto, [] as const),
) {}