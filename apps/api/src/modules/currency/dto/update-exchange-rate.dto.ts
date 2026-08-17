import { IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class UpdateExchangeRateDto {
  @IsNumber()
  @Min(0)
  rate: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
