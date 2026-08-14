import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReseauMobileMoney } from '../enums/reseau.enum';

export enum StatutBeneficiaire {
  TOUS = 'TOUS',
  VERIFIE = 'VERIFIE',
  NON_VERIFIE = 'NON_VERIFIE',
}

export class FilterBeneficiaireDto {
  @ApiPropertyOptional({ description: 'Recherche par nom ou numéro' })
  @IsOptional()
  @IsString()
  recherche?: string;

  @ApiPropertyOptional({ enum: StatutBeneficiaire, default: StatutBeneficiaire.TOUS })
  @IsOptional()
  @IsEnum(StatutBeneficiaire)
  statut?: StatutBeneficiaire = StatutBeneficiaire.TOUS;

  @ApiPropertyOptional({ enum: ReseauMobileMoney })
  @IsOptional()
  @IsEnum(ReseauMobileMoney)
  reseau?: ReseauMobileMoney;

  @ApiPropertyOptional({ description: 'Code pays ISO (ex: CM)' })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number = 10;
}