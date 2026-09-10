import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ example: 'DOUNTSOP Naouel' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'naouel@admin.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  motdepasse: string;
}
