import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ description: 'ID of the user to add as member' })
  @IsInt()
  userId: number;

  @ApiPropertyOptional({ description: 'Beneficiary order (1-based)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  beneficiaryOrder?: number;
}
