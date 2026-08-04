
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LinkedAccountType } from '../enums/linked-account-type.enum';
import { LinkedAccountOperator } from '../enums/linked-account-operator.enum';

export class CreateLinkedAccountDto {
  @ApiProperty({ description: 'ID du wallet à rattacher' })
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @ApiProperty({ enum: LinkedAccountType, description: 'Type de compte externe' })
  @IsEnum(LinkedAccountType)
  @IsNotEmpty()
  type: LinkedAccountType;

  @ApiProperty({ enum: LinkedAccountOperator, description: 'Opérateur ou banque' })
  @IsEnum(LinkedAccountOperator)
  @IsNotEmpty()
  operator: LinkedAccountOperator;

  @ApiProperty({ description: 'Libellé du compte (ex: "MTN MoMo personnel")' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone (Mobile Money)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Numéro de compte bancaire' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Nom de la banque' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ description: 'IBAN' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  iban?: string;

  @ApiPropertyOptional({ description: 'Code SWIFT/BIC' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  swiftCode?: string;

  @ApiPropertyOptional({ description: 'Devise du compte', default: 'XAF' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  currency?: string;
}