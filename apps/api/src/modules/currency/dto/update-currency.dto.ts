import { IsString, IsOptional, Length, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class UpdateCurrencyDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  symbol?: string;

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
