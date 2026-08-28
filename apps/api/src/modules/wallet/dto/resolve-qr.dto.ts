import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveQrDto {
  @ApiProperty({ example: '2371234567890' })
  @IsString()
  @Matches(/^\d{10,20}$/, { message: 'Numéro de portefeuille invalide.' })
  walletNumber: string;
}
