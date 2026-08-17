import { IsString, IsOptional, Length, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @Length(3, 3)
  code: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 10)
  symbol: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  decimals?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  flag?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
