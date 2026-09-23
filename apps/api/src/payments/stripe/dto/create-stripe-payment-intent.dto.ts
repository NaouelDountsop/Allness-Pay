import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

const AMOUNT_REGEX = /^(?!0*(\.0+)?$)\d+(\.\d{1,2})?$/;

export class CreateStripePaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  walletNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(AMOUNT_REGEX, {
    message: 'amount doit être un nombre strictement positif avec 2 décimales max',
  })
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tontineId?: string;
}
