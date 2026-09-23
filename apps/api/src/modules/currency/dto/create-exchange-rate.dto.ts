import { IsString, Length, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  @Length(3, 3)
  fromCurrencyCode: string;

  @IsString()
  @Length(3, 3)
  toCurrencyCode: string;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
