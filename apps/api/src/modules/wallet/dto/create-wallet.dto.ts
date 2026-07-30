import { IsString, IsOptional, Length, IsIn } from 'class-validator';

// Devises supportées par la plateforme. À adapter selon vos besoins réels.
export const SUPPORTED_CURRENCIES = ['XAF', 'USD', 'EUR'] as const;


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