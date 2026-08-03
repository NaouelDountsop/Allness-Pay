import { IsString, IsOptional, Length, IsIn } from 'class-validator';

// Devises supportées par la plateforme — couvre les 20 pays du frontend.
export const SUPPORTED_CURRENCIES = [
  'XAF', 'XOF', 'CDF', 'GNF', 'RWF', 'KES',
  'GHS', 'NGN', 'ZAR', 'EUR', 'CAD', 'USD',
] as const;


export class CreateWalletDto {
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES, {
    message: `currency doit être l'une des valeurs suivantes: ${SUPPORTED_CURRENCIES.join(', ')}`,
  })
  currency?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  label?: string;
}