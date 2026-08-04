
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InvitationResponse {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
}

export class RespondInvitationDto {
  @ApiProperty({ description: 'Response to the invitation', enum: InvitationResponse })
  @IsEnum(InvitationResponse)
  response: InvitationResponse;
}