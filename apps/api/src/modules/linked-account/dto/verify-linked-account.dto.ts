import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyLinkedAccountDto {
  @ApiProperty({ description: 'Code de vérification reçu par SMS/email' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  code: string;
}
