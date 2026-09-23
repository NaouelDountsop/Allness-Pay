import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveQrDto {
  @ApiProperty({ example: 'WLT1234567890' })
  @IsString()
  @Matches(/^WLT\d{10}$/, { message: 'Numéro de portefeuille invalide.' })
  walletNumber: string;
}
