import { IsString, IsNumber, IsEnum, IsOptional, Length, Min, Max } from 'class-validator';
import { TontineFrequency } from '../entities/tontine.entity';

export class CreateTontineDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsNumber()
  @Min(100)
  montantCotisation: number;

  @IsEnum(TontineFrequency)
  frequence: TontineFrequency;

  @IsNumber()
  @Min(2)
  @Max(50)
  nombreMembres: number;

  @IsOptional()
  @IsString()
  lieu?: string;

  @IsOptional()
  @IsString()
  devise?: string;
}
