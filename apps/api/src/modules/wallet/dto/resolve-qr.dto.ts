import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveQrDto {
  @ApiProperty({ example: 'a83f4d9c2e8b7a1f...' })
  @IsString()
  @Matches(/^[a-f0-9]{64}$/, { message: 'Token QR invalide.' })
  qrCodeToken: string;
}
