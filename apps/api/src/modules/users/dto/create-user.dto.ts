import { IsString, IsEmail, Length, IsDateString, IsOptional, IsPhoneNumber } from 'class-validator';

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

  @IsPhoneNumber()
  telephone: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  adresse?: string;

  @IsEmail()
  email: string;


  @IsString()
  @Length(6, 32)
  motdepasse: string;

      @IsString()
    @Length(3, 100)
    profession: string;
}