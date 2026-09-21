import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Transfert' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'TRANSFER' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Questions sur les transferts d\'argent' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
