import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateLinkedAccountDto } from './create-linked-account.dto';

export class UpdateLinkedAccountDto extends PartialType(CreateLinkedAccountDto) {
  @ApiPropertyOptional({ description: 'Définir comme compte par défaut' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}