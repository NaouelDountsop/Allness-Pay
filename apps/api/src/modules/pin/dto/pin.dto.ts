import { IsString, Length, Matches, IsIn, IsOptional } from 'class-validator';

const PIN_REGEX = /^\d{4}$/;

// Première création du PIN, à la première ouverture du wallet.
export class CreatePinDto {
  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  pin: string;

  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  pinConfirmation: string;
}

// Changement volontaire depuis Paramètres > Sécurité > Modifier le PIN.
export class ChangePinDto {
  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  oldPin: string;

  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  newPin: string;

  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  newPinConfirmation: string;
}

// Déclenche l'envoi d'un OTP par email ou SMS.
export class ForgotPinDto {
  @IsOptional()
  @IsIn(['sms', 'email'])
  channel?: 'sms' | 'email';
}

// Finalise le reset après validation de l'OTP.
export class ResetPinDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: "L'OTP doit contenir exactement 6 chiffres" })
  otp: string;

  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  newPin: string;

  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  newPinConfirmation: string;
}

// Vérification ponctuelle (ex: avant d'afficher un écran sensible côté front),
// sans opération métier associée. Passe par le même compteur d'échecs / verrou.
export class VerifyPinDto {
  @IsString()
  @Length(4, 4)
  @Matches(PIN_REGEX, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  pin: string;
}