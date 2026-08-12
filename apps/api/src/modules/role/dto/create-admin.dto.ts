import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'jean@admin.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  motdepasse: string;
}
