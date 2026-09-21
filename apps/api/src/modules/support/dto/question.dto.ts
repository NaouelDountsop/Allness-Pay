import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ example: 'Comment envoyer de l\'argent ?' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ example: ['envoyer', 'argent', 'transfert'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class SearchDto {
  @ApiProperty({ example: 'comment envoyer argent' })
  @IsString()
  q: string;
}
