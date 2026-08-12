import { IsString, IsOptional, Length, Matches, IsUUID } from 'class-validator';

// Le montant est reçu en string pour éviter toute perte de précision
// liée au parsing JSON en float côté client/serveur.
// Format: nombre strictement positif avec au maximum 2 décimales, ex: "1500", "1500.50".
// Le lookahead (?!0*(\.0+)?$) exclut "0", "0.0", "0.00", etc.
const AMOUNT_REGEX = /^(?!0*(\.0+)?$)\d+(\.\d{1,2})?$/;
const PIN_REGEX = /^\d{4}$/;
// Numéro camerounais : 9 chiffres (national) ou 12 avec indicatif 237
const PHONE_REGEX = /^(\d{9}|237\d{9}|\+237\d{9})$/;

// Le dépôt ne touche jamais au PIN : la création du PIN passe par le module
// `pin`, déclenchée à la première ouverture du wallet.
export class DepositDto {
  @IsString()
  @Matches(AMOUNT_REGEX, {
    message: 'amount doit être un nombre strictement positif avec 2 décimales max',
  })
  amount: string;

  @IsString()
  @Matches(PHONE_REGEX, {
    message:
      'phone_number doit être un numéro camerounais valide (9 chiffres ou avec indicatif 237)',
  })
  phone_number: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;
}

export class WithdrawDto {
  @IsString()
  @Matches(AMOUNT_REGEX, {
    message: 'amount doit être un nombre strictement positif avec 2 décimales max',
  })
  amount: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;

  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  pin: string;
}

export class TransferDto {
  @IsUUID()
  toWalletId: string;

  @IsString()
  @Matches(AMOUNT_REGEX, {
    message: 'amount doit être un nombre strictement positif avec 2 décimales max',
  })
  amount: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;

  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  pin: string;
}
