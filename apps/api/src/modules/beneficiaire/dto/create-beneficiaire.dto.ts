import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReseauMobileMoney } from '../enums/reseau.enum';

export class CreateBeneficiaireDto {
  @ApiProperty({ example: 'Jean Kamga' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom du bénéficiaire est requis' })
  nom: string;

  @ApiProperty({ example: '+237690000000' })
  @IsString()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'Le numéro doit être un numéro de téléphone valide',
  })
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