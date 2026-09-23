import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'uuid-category' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Comment effectuer un transfert ?' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Pour effectuer un transfert, ouvrez votre portefeuille...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: ['comment envoyer', 'transfert', 'envoyer argent'],
  })
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class UpdateArticleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
