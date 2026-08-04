import { IsInt, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContributeDto {
  @ApiProperty({ description: 'ID of the cycle to contribute to' })
  @IsInt()
  cycleId: number;

  @ApiProperty({ description: 'Amount in centimes (FCFA)', example: '50000' })
  @IsString()
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
