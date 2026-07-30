import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdministrateurStatut } from '../entities/administrateur.entity';

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiPropertyOptional({ example: 'jean@admin.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ enum: AdministrateurStatut })
  @IsEnum(AdministrateurStatut)
  @IsOptional()
  statut?: AdministrateurStatut;
}
