import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { TontineFrequency } from '../entities/tontine.entity';

export class CreateTontineDto {
  @IsString()
  @Length(3, 120)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsInt()
  @Min(500)
  contributionAmount: number;

  @IsEnum(TontineFrequency)
  frequency: TontineFrequency;

  @IsInt()
  @Min(2)
  // @Max(50)
  memberLimit: number;

  @IsOptional()
  @IsString()
  @Length(3, 10)
  currency?: string;
}
