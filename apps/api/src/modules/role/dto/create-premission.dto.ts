import { IsString, IsOptional, Matches, Length } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @Matches(/^[a-z-]+:[a-z-]+$/, {
    message: "Le nom doit suivre le format 'ressource:action', ex: 'kyc:validate'",
  })
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;
}
