import { IsEnum, IsInt, IsOptional, IsString, Length, Min, Max } from 'class-validator';
import { TontineFrequency } from '../entities/tontine.entity';

export class CreateTontineDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsInt()
  @Min(500)
  montantCotisation: number;

  @IsEnum(TontineFrequency)
  frequence: TontineFrequency;

  @IsInt()
  @Min(2)
  @Max(50)
  nombreMembres: number;

  @IsOptional()
  @IsString()
  @Length(3, 10)
  devise?: string;

  //@IsOptional()
  //@IsString()
  //lieu?: string;
}
