import { IsString, IsNumberString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContributeFromWalletDto {
  @ApiProperty({ description: 'Amount in centimes (FCFA)', example: '50000' })
  @IsNumberString()
  @Length(1, 20)
  amount: string;

  @ApiProperty({ description: 'ID of the wallet to debit' })
  @IsString()
  walletId: string;

  @ApiProperty({ description: 'PIN for wallet verification', example: '1234' })
  @IsString()
  @Length(4, 4)
  pin: string;
}
