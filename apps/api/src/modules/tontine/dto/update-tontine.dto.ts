import { IsString, IsNumber, IsEnum, IsOptional, Length, Min, Max } from 'class-validator';
import { TontineFrequency, TontineStatus } from '../entities/tontine.entity';

export class UpdateTontineDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(100)
  montantCotisation?: number;

  @IsOptional()
  @IsEnum(TontineFrequency)
  frequence?: TontineFrequency;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(50)
  nombreMembres?: number;

  @IsOptional()
  @IsEnum(TontineStatus)
  statut?: TontineStatus;

  @IsOptional()
  @IsString()
  lieu?: string;
}
