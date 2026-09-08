import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStripePaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  walletNumber: string;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
