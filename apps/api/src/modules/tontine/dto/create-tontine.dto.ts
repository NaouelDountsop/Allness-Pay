import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { TontineFrequency } from '../enums/tontine-frequency.enum';

export class CreateTontineDto {
  @IsString()
  @Length(3, 120)
  name: string;

  @IsOptional()
  @IsString()
  @Length(3, 500)
  description?: string;

  @IsString()
  @Length(1, 20)
  targetAmount: string;

  @IsString()
  @Length(1, 20)
  contributionAmount: string;

  @IsInt()
  @Min(2)
  memberLimit: number;

  @IsString()
  @Length(3, 10)
  currency: string;

  @IsEnum(TontineFrequency)
  frequency: TontineFrequency;
}
