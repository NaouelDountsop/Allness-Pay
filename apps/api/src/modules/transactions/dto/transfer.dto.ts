import { IsString, IsOptional, Length, Matches } from 'class-validator';

const AMOUNT_REGEX = /^(?!0*(\.0+)?$)\d+(\.\d{1,2})?$/;
const PIN_REGEX = /^\d{4}$/;

export class TransferDto {
  @IsString()
  @Length(1, 255)
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
