import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MaxLength(2000)
  message: string;
}

export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  content: string;
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  agentId?: number;
}
