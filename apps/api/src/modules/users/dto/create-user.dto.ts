import {
  IsString,
  IsEmail,
  Length,
  IsDateString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @Length(3, 100, { message: 'Le nom doit contenir entre 3 et 100 caractères.' })
  nom: string;

  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @Length(3, 100, { message: 'Le prénom doit contenir entre 3 et 100 caractères.' })
  prenom: string;

  @IsDateString({}, { message: 'La date de naissance n\'est pas valide (format YYYY-MM-DD).' })
  datenaissance: Date;

  @IsString({ message: 'Le sexe doit être une chaîne de caractères.' })
  @Length(1, 10, { message: 'Le sexe doit contenir entre 1 et 10 caractères.' })
  sexe: string;

  @IsString({ message: 'Le pays doit être une chaîne de caractères.' })
  @Length(3, 100, { message: 'Le pays doit contenir entre 3 et 100 caractères.' })
  pays: string;

  @IsString({ message: 'La ville doit être une chaîne de caractères.' })
  @Length(3, 100, { message: 'La ville doit contenir entre 3 et 100 caractères.' })
  ville: string;

  @IsPhoneNumber(undefined, { message: 'Le numéro de téléphone n\'est pas valide.' })
  telephone: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères.' })
  @Length(3, 255, { message: 'L\'adresse doit contenir entre 3 et 255 caractères.' })
  adresse?: string;

  @IsEmail({}, { message: 'L\'adresse email n\'est pas valide.' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @Length(6, 32, { message: 'Le mot de passe doit contenir entre 6 et 32 caractères.' })
  motdepasse?: string;

  @IsString({ message: 'La profession doit être une chaîne de caractères.' })
  @Length(3, 100, { message: 'La profession doit contenir entre 3 et 100 caractères.' })
  profession: string;

  @IsOptional()
  @IsString({ message: 'L\'identifiant Google doit être une chaîne de caractères.' })
  googleId?: string;
}
