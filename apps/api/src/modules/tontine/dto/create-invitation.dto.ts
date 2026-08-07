
import { IsEmail, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiPropertyOptional({ description: 'ID of the user to invite' })
  @IsOptional()
  @IsInt()
  inviteeUserId?: number;

  @ApiPropertyOptional({ description: 'Email of the person to invite' })
  @IsOptional()
  @IsEmail()
  inviteeEmail?: string;
}
