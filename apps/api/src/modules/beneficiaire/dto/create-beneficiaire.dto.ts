import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReseauMobileMoney } from '../enums/reseau.enum';

export class CreateBeneficiaireDto {
  @ApiProperty({ example: 'Jean Kamga' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du bénéficiaire est requis' })
  nom: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @IsNotEmpty({ message: 'Le numéro du bénéficiaire est requis' })
  numero: string;

  @ApiProperty({ enum: ReseauMobileMoney, example: ReseauMobileMoney.MTN_MOMO })
  @IsEnum(ReseauMobileMoney, { message: 'Réseau invalide' })
  reseau: ReseauMobileMoney;

  @ApiProperty({ example: 'CM', description: 'Code pays ISO à 2 lettres' })
  @IsString()
  @Length(2, 2, { message: 'Le code pays doit contenir 2 caractères (ex: CM)' })
  pays: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  favori?: boolean;
}