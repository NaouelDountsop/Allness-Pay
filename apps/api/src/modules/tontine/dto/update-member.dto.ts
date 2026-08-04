
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TontineMemberRole } from '../enums/tontine-member-role.enum';

export class UpdateMemberDto {
  @ApiPropertyOptional({ description: 'Member role', enum: TontineMemberRole })
  @IsOptional()
  @IsEnum(TontineMemberRole)
  role?: TontineMemberRole;

  @ApiPropertyOptional({ description: 'Beneficiary order (1-based)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  beneficiaryOrder?: number;
}