import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBeneficiaireDto } from './create-beneficiaire.dto';

// Le numéro et le réseau ne sont pas modifiables une fois le bénéficiaire créé :
// pour changer de numéro/réseau, on supprime et on recrée le bénéficiaire.
export class UpdateBeneficiaireDto extends PartialType(
  OmitType(CreateBeneficiaireDto, ['numero', 'reseau'] as const),
) {}