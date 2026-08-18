import { IsString, IsOptional, Length, IsIn } from 'class-validator';

export const SUPPORTED_CURRENCIES = [
  'XAF',
  'XOF',
  'CAD',
  'EUR',
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
