import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Pagination par curseur. Preferee a l'offset : elle reste stable quand des
 * lignes sont inserees pendant la navigation, ce qui est le cas permanent sur
 * un historique de transactions.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ description: 'Curseur opaque renvoye par la page precedente' })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items!: T[];

  @ApiProperty({ nullable: true, description: 'Curseur de la page suivante' })
  nextCursor!: string | null;

  @ApiProperty()
  hasMore!: boolean;

  constructor(items: T[], nextCursor: string | null) {
    this.items = items;
    this.nextCursor = nextCursor;
    this.hasMore = nextCursor !== null;
  }
}
