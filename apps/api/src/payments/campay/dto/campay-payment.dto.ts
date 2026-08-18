import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length, Matches } from 'class-validator';

const AMOUNT_REGEX = /^(?!0*(\.0+)?$)\d+(\.\d{1,2})?$/;
const PHONE_REGEX = /^(\d{9}|237\d{9}|\+237\d{9})$/;
const WALLET_NUMBER_REGEX = /^WLT\d{10}$/;

export class CampayPaymentDto {
  @ApiProperty({
    example: 'WLT1234567890',
    description: 'Numéro du wallet à créditer, format WLT + 10 chiffres',
  })
  @IsString()
  @Matches(WALLET_NUMBER_REGEX, {
    message: 'walletNumber doit être au format WLT suivi de 10 chiffres (ex: WLT1234567890)',
  })
  walletNumber: string;

  @ApiProperty({
    example: '1000',
    description: 'Montant à déposer en XAF (nombre positif, 2 décimales max)',
  })
  @IsString()
  @Matches(AMOUNT_REGEX, {
    message: 'amount doit être un nombre strictement positif avec 2 décimales max',
  })
  amount: string;

  @ApiProperty({
    example: '237680657567',
    description:
      'Numéro mobile money camerounais (MTN ou Orange). 9 chiffres, avec ou sans indicatif 237',
  })
  @IsString()
  @Matches(PHONE_REGEX, {
    message:
      'phone_number doit être un numéro camerounais valide (9 chiffres ou avec indicatif 237)',
  })
  phone_number: string;

  @ApiPropertyOptional({
    example: 'Dépôt AllnessPay',
    description: 'Description libre affichée sur la transaction',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;
}
