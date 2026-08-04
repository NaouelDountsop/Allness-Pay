import { IsString, IsEmail, Length, IsDateString, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 100)
  nom: string;

  @IsString()
  @Length(3, 100)
  prenom: string;

  @IsDateString()
  datenaissance: Date;

  @IsString()
  @Length(1, 10)
  sexe: string;

  @IsString()
  @Length(3, 100)
  pays: string;

  @IsString()
  @Length(3, 100)
  ville: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'Numéro de téléphone invalide' })
  telephone: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  adresse?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(6, 32)
  motdepasse?: string;

  @IsString()
  @Length(3, 100)
  profession: string;

  @IsOptional()
  @IsString()
  googleId?: string;
}